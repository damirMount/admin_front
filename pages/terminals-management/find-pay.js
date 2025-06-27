import {Button, Checkbox, DatePicker, Divider, Input, Typography} from "antd";
import React, {useEffect, useRef, useState} from "react";
import {useSession} from "next-auth/react";
import Head from "next/head";
import ProtectedElement from "../../components/main/system/ProtectedElement";
import {useAlert} from "../../contexts/AlertContext";
import dayjs from "dayjs";
import {
    DOWNLOAD_TERMINAL_PAYMENT_LOGS_API,
    FIND_TERMINAL_PAYMENT_LOGS_API,
    GET_TERMINALS_LIST_API
} from "../../routes/api";
import humanizeDuration from "humanize-duration";
import fetchData from "../../components/main/database/DataFetcher";
import UniversalSelect from "../../components/main/input/UniversalSelect";
import {CheckCircleFilled, CloseCircleFilled, DownloadOutlined, SyncOutlined, WarningFilled} from "@ant-design/icons";
import ApparatLogsCard from "../../components/pages/apparat/ApparatLogsCard";
import plural from 'plural-ru';
import {isEmpty} from "lodash";

const {Title, Text} = Typography;

export default function ApparatReRegistrationPage() {
    const {openNotification} = useAlert();
    const {data: session} = useSession();

    const [loading, setLoading] = useState(false);
    const [downloadLoading, setDownloadLoading] = useState(false);

    const [terminals, setTerminals] = useState([]);
    const [services, setServices] = useState([]);
    const [selectedTerminal, setSelectedTerminal] = useState('');
    const [identifier, setIdentifier] = useState('');
    const [logsType, setLogsType] = useState('');
    const [againDownloadLog, setAgainDownloadLog] = useState(false);

    const [paymentDate, setPaymentDate] = useState(dayjs().format('YYYYMMDD'));
    const [accurateSearch, setAccurateSearch] = useState(true);

    const [logsResult, setLogsResult] = useState({
        status: 'info',
        desc: '',
        stage: 1,
        payments: [],
    });

    const secondsRef = useRef(0);
    const timerRef = useRef(null);
    const [timeLeft, setTimeLeft] = useState('0 сек');

    const MAX_ATTEMPTS = 5;

    const sendWithRetry = async (attempt = 1) => {
        if (!selectedTerminal) {
            openNotification({type: 'error', message: 'Выберите терминал.'});
            return false;
        }
        if (isEmpty(identifier) && logsType !== 'all_payments') {
            openNotification({type: 'error', message: 'Укажите данные для поиска'});
            return false;
        }

        try {
            const res = await fetch(FIND_TERMINAL_PAYMENT_LOGS_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify([{
                    selectedTerminal,
                    identifier,
                    paymentDate,
                    logsType,
                    accurateSearch,
                    againDownloadLog,
                    userId: session?.user?.id,
                }]),
            });

            const result = await res.json();

            if (res.ok) {
                setLogsResult({
                    status: result.resultCode === '0' ? 'success' : 'warning',
                    desc: result.resultDescription,
                    payments: result.payments,
                    stage: 1,
                });
                return true;
            }

            throw new Error(result.resultDescription);
        } catch (error) {
            console.error(`Попытка ${attempt} не удалась:`, error);

            if (attempt < MAX_ATTEMPTS) {
                await new Promise(res => setTimeout(res, 1000));
                setLogsResult(prev => ({...prev, stage: attempt + 1}));
                return sendWithRetry(attempt + 1);
            } else {
                setLogsResult({status: 'error', desc: error.message, payments: [], stage: 1});
                return false;
            }
        }
    };

    const downloadLog = async () => {
        setDownloadLoading(true);

        try {
            const res = await fetch(DOWNLOAD_TERMINAL_PAYMENT_LOGS_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify([{
                    downloadedLogTerminal: selectedTerminal,
                    paymentDate,
                    userId: session?.user?.id,
                }]),
            });

            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.resultDescription || 'Ошибка загрузки');
            }

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');

            a.href = url;
            a.download = `terminalLogs_${selectedTerminal}_${paymentDate}.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);

        } catch (error) {
            openNotification({type: 'error', message: error.message || 'Ошибка загрузки'});
        }

        setDownloadLoading(false);
    };

    const handleSend = async () => {
        setTimeLeft('0 сек');
        secondsRef.current = 0;

        setLogsResult(prev => ({...prev, payments: []}));
        setLoading(true);

        await sendWithRetry();

        setLoading(false);
        setDownloadLoading(false);
    };

    useEffect(() => {
        if (loading) {
            timerRef.current = setInterval(() => {
                secondsRef.current += 1;
                setTimeLeft(humanizeDuration(secondsRef.current * 1000, {
                    language: 'shortRu',
                    languages: {
                        shortRu: {
                            y: () => 'г', mo: () => 'мес', w: () => 'нед', d: () => 'дн',
                            h: () => 'ч', m: () => 'мин', s: () => 'сек', ms: () => 'мс',
                        }
                    },
                    largest: 2,
                    round: true,
                    units: ['h', 'm', 's'],
                    spacer: ' ',
                }));
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [loading]);

    const loadData = async () => {
        try {
            const [terminalsRes, servicesRes] = await Promise.all([
                fetch(GET_TERMINALS_LIST_API, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session?.accessToken}`,
                    }
                }),
                fetchData({model: 'Service'}, session),
            ]);

            const terminalsData = await terminalsRes.json();
            setTerminals(terminalsData.data || []);
            setServices(servicesRes.data || []);
        } catch (error) {
            console.error(error);
            openNotification({
                type: 'error',
                message: 'Ошибка при загрузке справочников: ' + (error.message || error),
            });
        }
    };

    useEffect(() => {
        loadData();
    }, [session]);

    return (
        <ProtectedElement allowedPermissions="apparats_managment">
            <Head>
                <title>Поиск платежа | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div className="container d-flex flex-column justify-content-center">
                <div className="d-flex flex-row justify-content-start mt-3">
                    <div className="card card-body w-50 d-flex flex-column justify-content-start">
                        <div className="d-flex h-100 flex-column mb-3">
                            <Title level={5}>Поиск платежа</Title>
                            <UniversalSelect
                                label="Терминал"
                                placeholder="Выберите терминал"
                                name="terminal_id"
                                isDisabled={loading}
                                options={terminals.map((item) => ({
                                    value: item.id,
                                    label: `${item.id} ${item.name}`,
                                }))}
                                isSearchable
                                onSelectChange={setSelectedTerminal}
                            />

                            <div className='d-flex justify-content-between w-100 align-items-center'>
                                <div>
                                    <Text type={"secondary"}>Значение для поиска</Text>
                                    <Input
                                        size={"large"}
                                        rootClassName={'mt-1'}
                                        placeholder={`Введите значение`}
                                        disabled={loading || logsType === 'all_payments'}
                                        onChange={(e) => {
                                            setIdentifier(e.target.value)
                                        }}
                                    />
                                </div>
                                <div className='d-flex flex-column w-50 ms-3 '>
                                    <Text type='secondary' className='mb-1'>Дата платежа</Text>
                                    <DatePicker
                                        allowClear={false}
                                        onChange={(date) => {
                                            setPaymentDate(date.format('YYYYMMDD'));
                                        }}
                                        disabled={loading}
                                        maxDate={dayjs()}
                                        defaultValue={dayjs()}
                                        placement={"bottomLeft"}
                                        size={"large"}/>
                                </div>
                            </div>
                            <div className='d-flex justify-content-between w-100 align-items-center'>
                                <UniversalSelect
                                    label="Тип поиска"
                                    isDisabled={loading}
                                    placeholder="Выберите тип поиска платежа"
                                    name="logs_type"
                                    isSearchable={false}
                                    firstOptionSelected={true}
                                    options={[
                                        {value: 'identifier', label: 'По реквизиту'},
                                        {value: 'trans_id', label: 'По номеру транзакции'},
                                        {value: 'all_payments', label: 'Все платежи'},
                                    ]}
                                    onSelectChange={setLogsType}
                                />
                                <div className='d-flex flex-column w-75 ms-3 '>
                                    <UniversalSelect
                                        label="Точность поиска"
                                        isDisabled={loading || logsType === 'all_payments'}
                                        isSearchable={false}
                                        placeholder="Выберите степень точности поиска"
                                        name="accurateSearch"
                                        firstOptionSelected={true}
                                        options={[
                                            {value: true, label: 'Точный'},
                                            {value: false, label: 'Мягкий'},
                                        ]}
                                        onSelectChange={setAccurateSearch}
                                    />
                                </div>
                            </div>
                            {logsType === 'identifier' && (
                                <Text className='mt-2'>
                                    <b>• Поиск по реквизиту</b> — находит платежи, в которых указан введённый
                                    пользователем реквизит.
                                </Text>
                            )}
                            {logsType === 'trans_id' && (
                                <Text className='mt-2'>
                                    <b>• Поиск по номеру транзакции</b> — ищет платеж по уникальному номеру транзакции,
                                    присвоенному терминалом.
                                </Text>
                            )}
                            {logsType === 'all_payments' && (
                                <Text className='mt-2'>
                                    <b>• Все платежи</b> — отображает полный список всех платежей, совершённых на
                                    терминале в выбранную дату.
                                </Text>
                            )}
                            {accurateSearch ? (
                                <Text className='mt-2'>
                                    <b>• Точный поиск</b> — показывает только те результаты, которые полностью совпадают
                                    с введённым значением.
                                </Text>
                            ) : (
                                <Text className='mt-2'>
                                    <b>• Мягкий поиск</b> — отображает все подходящие платежи, частично совпадающие с
                                    указанным значением поиска.
                                </Text>
                            )}
                        </div>
                        <div className='d-flex flex-column border-top mb-3'>
                            <Checkbox defaultChecked={againDownloadLog} disabled={loading}
                                      className='mt-3'
                                      onChange={(e) => {
                                          setAgainDownloadLog(e.target.checked)
                                      }}>
                                Повторная выгрузка логов с терминала
                            </Checkbox>
                            <Text type='secondary' className='mt-2'>
                                Если эта опция включена, логи с терминала будут скачаны заново. Используйте
                                эту функцию когда считаете что текущие логи не актуальны, либо их файл повреждён.
                            </Text>
                        </div>
                        <Button type="primary" className="mt-2" onClick={handleSend} loading={loading}>
                            Отправить запрос
                        </Button>

                    </div>

                    <div className='w-75 h-100 d-flex flex-column align-content-between justify-content-between'>
                        {loading ? (
                            <div className="d-flex flex-row h-100 card card-body align-items-center ms-3 mb-2">
                                <SyncOutlined spin className="color-purple"
                                              style={{minWidth: 70, minHeight: 70, fontSize: 70}}/>
                                <div
                                    className='w-100 ms-3 d-flex flex-column align-items-center border-start
                                    justify-content-center'>
                                    <Title level={5}>Выполнение запроса... ({logsResult.stage}/5) - {timeLeft}</Title>
                                    <Text className='ms-3 me-3' type='secondary'>
                                        Пожалуйста, подождите — первая загрузка логов требует времени.
                                        Повторные запросы проходят быстрее, но за текущую дату логи загружаются заново
                                        при каждом
                                        обращении для получения актуальных данных.
                                    </Text>
                                </div>
                            </div>
                        ) : (
                            <div className='d-flex flex-column justify-content-between h-100 align-content-between'>

                                {logsResult.status === 'success' && (
                                    <div className="d-flex flex-row card card-body align-items-center ms-3 mb-2">
                                        <CheckCircleFilled
                                            className="text-success"
                                            style={{minWidth: 70, minHeight: 70, fontSize: 70}}
                                        />
                                        <div
                                            className='w-100 ms-3 d-flex flex-column align-items-center border-start
                                                justify-content-center'>
                                            <Title level={5}>
                                                {
                                                    `Логи  ${plural(logsResult.payments?.length || 0, 'платежа', 'платежей')}
                                                     были успешно получены!`
                                                }
                                            </Title>
                                            <Text className="ms-3 me-3" type="secondary">{
                                                `По вашему запросу
                                                ${plural(logsResult.payments?.length || 0, 'был найден', 'было найдено')}
                                                ${logsResult.payments?.length || 0}
                                                ${plural(logsResult.payments?.length || 0, 'платеж', 'платежа', 'платежей')} 
                                                за ${timeLeft}!`
                                            }

                                            </Text>
                                        </div>
                                    </div>
                                )}

                                {logsResult.status === 'warning' && (
                                    <div className="d-flex flex-row card card-body align-items-center ms-3 mb-2">
                                        <WarningFilled
                                            className="text-warning"
                                            style={{minWidth: 70, minHeight: 70, fontSize: 70}}
                                        />
                                        <div
                                            className='w-100 ms-3 d-flex flex-column align-items-center border-start
                                            justify-content-center'>
                                            <Title level={5}>Платёж не найден - {timeLeft} :( </Title>
                                            <Text className='ms-3 me-3' type='secondary'>Перепроверьте введённые
                                                данные
                                                и попробуйте снова, либо отправьте запрос на инкассацию
                                                терминала</Text>
                                        </div>
                                    </div>
                                )}

                                {logsResult.status === 'error' && (
                                    <div className="d-flex flex-row card card-body align-items-center ms-3 mb-2">
                                        <CloseCircleFilled
                                            className="text-danger"
                                            style={{minWidth: 70, minHeight: 70, fontSize: 70}}
                                        />
                                        <div
                                            className='w-100 ms-3 d-flex flex-column align-items-center border-start
                                            justify-content-center'>
                                            <Title level={5}>Не удалось выгрузить логи - {timeLeft} :( </Title>
                                            <Text className='ms-3 me-3' type='secondary'>
                                                {logsResult.desc || 'Во время запроса произошла не предвиденная ошибка'}
                                            </Text>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="d-flex flex-column card card-body align-items-start ms-3">
                            <Title level={5}>Описание</Title>
                            <Text>
                                На этой странице вы можете найти информацию о платеже, используя логи выбранного
                                терминала.
                            </Text>
                            <Text className='mt-2'>
                                Для поиска выберите терминал, дату платежа и введите значение — это может быть реквизит
                                (например, номер счёта или телефона) либо номер транзакции. Также укажите тип поиска:
                                точный (полное совпадение) или мягкий (поиск по части значения).
                            </Text>
                            <Text className='mt-2'>
                                При необходимости можно включить повторную загрузку логов с терминала — это поможет,
                                если текущие данные устарели или повреждены.
                            </Text>
                            <Text className='mt-2'>
                                <b>Обратите внимание:</b> первая загрузка логов может занять некоторое время, так как
                                данные
                                загружаются с терминала на сервер. Повторные запросы за ту же дату выполняются быстрее,
                                но логи за текущий день всегда загружаются заново для актуальности.
                            </Text>
                            <Text className='mt-2'>
                                После обработки запроса система покажет, найдены ли подходящие платежи. При успешном
                                результате вы сможете скачать архив с логами — в нём будет как оригинальный файл
                                терминала, так и расшифрованные данные по платежам.
                            </Text>

                            {logsResult.status === 'success' && !loading && (
                                <>
                                    <Divider className="border-secondary" dashed={true}>Скачать логи</Divider>
                                    <div
                                        className="d-flex flex-row align-items-center">
                                        <DownloadOutlined
                                            className='opacity-25'
                                            style={{
                                                fontSize: '70px',
                                            }}/>
                                        <div
                                            className='d-flex align-items-center w-100 h-100 ms-3 border-start'>
                                            <Text className='ms-3 me-4' type="secondary">
                                                Вы можете скачать полный архив логов терминала для последующего
                                                сравнения данных.
                                                Архив содержит оригинальный файл логов и расшифрованный файл с
                                                платежами, использованный при выгрузке данных.
                                            </Text>
                                            <Button  type="primary" loading={downloadLoading}
                                                    onClick={downloadLog}>Скачать</Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <ApparatLogsCard logsResult={logsResult} servicesOptionRaw={services}/>

            </div>
        </ProtectedElement>
    );
}
