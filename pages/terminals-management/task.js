import {Button, Checkbox, Descriptions, Result, Typography} from "antd";
import React, {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import Head from "next/head";
import ProtectedElement from "../../components/main/system/ProtectedElement";
import {useAlert} from "../../contexts/AlertContext";
import {GET_TERMINALS_LIST_API, SEND_TASK_TO_TERMINAL_API} from "../../routes/api";
import UniversalSelect from "../../components/main/input/UniversalSelect";
import {CloseCircleOutlined, SyncOutlined} from "@ant-design/icons";

const {Title, Text, Paragraph} = Typography;

export default function ApparatReRegistrationPage() {
    const {openNotification} = useAlert();
    const {data: session} = useSession();
    const [loading, setLoading] = useState(false);
    const MAX_ATTEMPTS = 5;

    const [terminalsOptionRaw, setTerminalsOptionRaw] = useState([]);
    const [selectedTerminal, setSelectedTerminal] = useState('')
    const [selectedTask, setSelectedTask] = useState('')
    const [taskResult, setTaskResult] = useState({
        status: 'info',
        desc: '',
        stage: 1
    })

    const taskDescriptions = {
        update_menu: "Загрузка актуального меню на терминал.",
        update_terminal: "Запуск обновления на терминале. Обновление может длиться от 5 до 30 минут в зависимости от качества связи.",
        reboot_terminal: "Перезагрузка терминала. После перезагрузки подождите 5 минут перед отправкой нового запроса.",
        check_connection: "Проверка соединения с терминалом. Если терминал не выходит на связь — отправьте техника для проверки.",
        clear_cache: "Очистка кеша терминала. Помогает при зависании терминала, и также для очистки памяти",
        printer_status: "Получение состояния принтера. Если принтер не работает — отправьте техника для проверки.",
        encashment_without_check: "Инкассация терминала без печати чека, если в нём есть деньги.",
        encashment: "Обычная инкассация терминала с печатью чека, если в нём есть деньги.",
        get_last_encashment_check: "Печать последнего чека инкассации.",
        restart_sb: "Перезапуск терминального ПО. Используйте, если софт не отвечает или работает некорректно.",
        restart_x_server: "Перезапуск графической оболочки и терминального софта. Полезно, если обычный перезапуск не помогает.",
        test_print: "Печать тестового чека для проверки работы принтера.",
        fix_firefox: "Восстановление профиля Firefox.",
        fix_trans_number: "Коррекция счётчика транзакций. Запускайте, если проведённые платежи не отображаются в системе.",
        remove_header: "Удаление заголовков в интерфейсе.",
        clear_logs: "Очистка логов терминала.",
    };


    const sendWithRetry = async (attempt = 1) => {

        if (!selectedTerminal) {
            openNotification({
                type: "error",
                message: "Выберите терминал, перед тем как отправить запрос",
            });
            return;
        }

        if (!selectedTask) {
            openNotification({
                type: "error",
                message: "Выберите задание, перед тем как отправить запрос",
            });
            return;
        }

        try {
            const response = await fetch(SEND_TASK_TO_TERMINAL_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify([
                    {
                        selectedTerminal: selectedTerminal,
                        selectedTask: selectedTask,
                        userId: session?.user?.id,
                    },
                ]),
            });

            const result = await response.json();

            if (response.ok) {
                setTaskResult({
                    status: result.resultCode === '0' && 'success' || result.resultCode === "1" && 'warning',
                    desc: result.resultDescription,
                    stage: 1,
                });
                return true;
            } else {
                throw new Error(result.resultDescription)
            }
        } catch (error) {
            console.error(`Ошибка при добавлении в очередь (попытка ${attempt}):`, error);
            if (attempt < MAX_ATTEMPTS) {
                await new Promise(res => setTimeout(res, 1000));
                setTaskResult(prev => ({
                    ...prev,
                    stage: attempt + 1
                }));

                return await sendWithRetry(attempt + 1);
            } else {
                setTaskResult({
                    status: 'error',
                    desc: error.message,
                    stage: 1,
                });
                return false;
            }
        }
    };

    const handleSend = async () => {
        setLoading(true);
        await sendWithRetry();
        setLoading(false);
    };

    const loadTerminals = async () => {
        try {
            const response = await fetch(GET_TERMINALS_LIST_API, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.accessToken}`,
                },
            });
            const result = await response.json();

            if (response.ok) {
                setTerminalsOptionRaw(result.data || []);
            } else {
                openNotification({type: "error", message: result.resultDescription});
            }
        } catch (error) {
            console.error("Ошибка при загрузке терминалов:", error);
            openNotification({
                type: "error",
                message: "Не удалось загрузить список терминалов",
            });
        }
    };

    useEffect(() => {
        loadTerminals();
    }, [session, openNotification]);

    return (
        <ProtectedElement allowedPermissions="apparats_service_menu">
            <Head>
                <title>Задания для терминала | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div className="container d-flex flex-column justify-content-center" style={{minHeight: '50vh'}}>
                <Title level={1}>Задания для терминала</Title>

                <div className="d-flex flex-row justify-content-start mt-5">
                    <div className="card card-body w-50 d-flex flex-column justify-content-start">
                        <div className="d-flex flex-column mb-3 h-100">
                            <UniversalSelect
                                label="Терминал"
                                placeholder="Выберите терминал"
                                name="terminal_id"
                                isDisabled={loading}
                                options={terminalsOptionRaw.map((item) => ({
                                    value: item.id,
                                    label: `${item.id} ${item.name}`,
                                }))}
                                isSearchable
                                required
                                onSelectChange={setSelectedTerminal}
                            />

                            <UniversalSelect
                                label="Операция"
                                isDisabled={loading}
                                placeholder="Выберите операцию"
                                name="task_type"
                                options={[
                                    {value: 'update_menu', label: 'Обновить меню'},
                                    {value: 'update_terminal', label: 'Обновить терминал'},
                                    {value: 'reboot_terminal', label: 'Перезапустить терминал'},
                                    {value: 'clear_cache', label: 'Очистка кеша'},
                                    {value: 'check_connection', label: 'Проверка связи'},
                                    {value: 'printer_status', label: 'Состояние принтера'},
                                    {value: 'encashment_without_check', label: 'Инкассация без чека'},
                                    {value: 'encashment', label: 'Инкассация с чеком'},
                                    {value: 'get_last_encashment_check', label: 'Распечатать чек последней инкассации'},
                                    {value: 'restart_sb', label: 'Перезапустить ПО (СБ,Флешку)'},
                                    {value: 'restart_x_server', label: 'Перезапустить ПО (X-сервер)'},
                                    {value: 'test_print', label: 'Печать тестового чека'},
                                    {value: 'fix_firefox', label: 'Исправить профиль firefox'},
                                    {value: 'fix_trans_number', label: 'Исправить счётчик операций'},
                                    {value: 'remove_header', label: 'Удаление заголовков(header)'},
                                    {value: 'clear_logs', label: 'Очистка логов'},
                                ]}
                                onSelectChange={setSelectedTask}
                                required
                            />

                            <Descriptions
                                className='mt-2'
                                layout="vertical"
                                size="small"
                                column={1}
                                items={
                                    selectedTask
                                        ? [
                                            {
                                                key: selectedTask,
                                                label: taskDescriptions[selectedTask] ? "Описание" : "Нет описания",
                                                children: taskDescriptions[selectedTask] || "Описание отсутствует",
                                            },
                                        ]
                                        : [{
                                            key: 'defaultDesc',
                                            label: "Описание",
                                            children: 'Выберете терминал а затем задание которое вы хотите выполнить. ' +
                                                'В списке терминалов указаны только активные терминалы, если вашего' +
                                                ' терминала в этом списке нет, проверьте его статус в админке.',
                                        },]
                                }
                            />

                        </div>

                        <Button type="primary" className="mt-4" onClick={handleSend} loading={loading}>
                            Отправить запрос
                        </Button>
                    </div>
                    <div className="d-flex card card-body w-75 justify-content-center ms-5">
                        {loading ? (
                            <Result
                                icon={<SyncOutlined className="color-purple" spin/>}
                                title={`Выполнение запроса... (${taskResult.stage}/5)`}
                                subTitle="Пожалуйста подождите, это может занять несколько минут..."
                            />

                        ) : (
                            <>
                                {taskResult.status === 'info' && (
                                    <Result
                                        status="info"
                                        title="Задания для терминала"
                                        subTitle="С помощью этого меню вы можете удалённо запускать различные команды для
                                         терминала, к примеру: обновление меню, определение комплектующих, инкассация и
                                          так далее. При выборе опции вы можете прочитать подробное описание за что
                                          именно отвечает та или иная операция"
                                    />
                                )}
                                {taskResult.status === 'success' && (
                                    <Result
                                        status='success'
                                        title="Запрос выполнен успешно!"
                                        subTitle={taskResult.desc}
                                    />
                                )}
                                {taskResult.status === 'warning' && (
                                    <Result
                                        status='warning'
                                        title="Запрос выполнен успешно!"
                                        subTitle={taskResult.desc}
                                    />
                                )}
                                {taskResult.status === 'error' && (
                                    <Result
                                        status="error"
                                        title="Не удалось выполнить запрос :("
                                        subTitle="Нам не удалось выполнить запрос, возможно в даный момент терминал не доступен.
                                        Пожалуйста подождите какое-то время, а затем попробуйте снова..."
                                    >
                                        <div className="desc">
                                            <Paragraph>
                                                <Text
                                                    strong
                                                    style={{
                                                        fontSize: 16,
                                                    }}
                                                >
                                                    Причина ошибки:
                                                </Text>
                                            </Paragraph>
                                            <Paragraph>
                                                <CloseCircleOutlined className="site-result-demo-error-icon"/>
                                                {taskResult.desc}
                                            </Paragraph>
                                        </div>
                                    </Result>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedElement>
    );
}
