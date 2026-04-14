import React, {useEffect, useState} from "react";
import {Button, Descriptions, Typography} from "antd";
import {useSession} from "next-auth/react";
import Head from "next/head";
import humanizeDuration from 'humanize-duration';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faCheckCircle,
    faCircleCheck,
    faCirclePause,
    faCirclePlay,
    faCircleXmark,
    faCreditCard,
    faFloppyDisk,
    faHourglassHalf,
    faIdCard,
    faKeyboard,
    faMoneyBill1,
    faSquarePlus,
    faTrashCan
} from "@fortawesome/free-regular-svg-icons";
import {
    faArrows,
    faBan,
    faClockRotateLeft,
    faGears,
    faHashtag,
    faLaptopCode,
    faPercent,
    faRotateRight,
    faSpinner,
    faTriangleExclamation,
    faUserMinus
} from "@fortawesome/free-solid-svg-icons";

import ProtectedElement from "../../components/main/system/ProtectedElement";
import fetchData from "../../components/main/database/DataFetcher";
import SmartTable from "../../components/main/table/SmartTable";
import StatusIndicator from "../../components/main/table/cell/StatusIndicator";
import SearchByColumn from "../../components/main/table/cell/SearchByColumn";
import ApparatReRegistrationForm from "../../components/pages/apparat/ApparatReRegistrationForm";
import ActionButtons from "../../components/main/table/cell/ActionButtons";
import {useAlert} from "../../contexts/AlertContext";
import {CHANGE_STATUS_RE_REGISTERED_TERMINAL_RECORD_API} from "../../routes/api";
import {getUserFio} from "../../components/main/system/GetUserFio";

const {Title, Text} = Typography;

// --- Константы маппинга ---
const STATUS_MAP = {
    completed: {icon: faCheckCircle, label: "Выполнено", color: "success"},
    failed: {icon: faTriangleExclamation, label: "Ошибка", color: "danger"},
    cancelled: {icon: faBan, label: "Отменён", color: "danger"},
    pending: {icon: faClockRotateLeft, label: "В очереди", color: "default"},
    in_progress: {icon: faSpinner, label: "Обрабатывается", color: "primary"},
    paused: {icon: faCirclePause, label: "Приостановлен", color: "gray"},
    waiting: {icon: faHourglassHalf, label: "В ожидании", color: "warning"},
};

const STAGE_MAP = {
    create_new_terminal: [1, "Создание новой точки", faSquarePlus],
    register_apparat: [2, "Регистрация новой точки", faIdCard],
    copy_apparat_params: [3, "Копирование настроек точки", faGears],
    copy_services: [4, "Копирование сервисов и комиссий", faPercent],
    copy_points: [5, "Копирование точек обновления", faArrows],
    encashment_run: [6, "Инкассация терминала", faMoneyBill1],
    terminal_registration_run: [7, "Перерегистрация терминала", faLaptopCode],
    fix_trans_number: [8, "Обновление номера транзакции", faHashtag],
    rename_hostname: [9, "Переименование HOSTNAME", faKeyboard],
    clear_terminal_logs: [10, "Очистка логов", faTrashCan],
    unregister_old_apparat: [11, "Разрегистрация старой точки", faUserMinus],
    update_run: [12, "Обновление терминала", faFloppyDisk],
    completed: [13, "Завершён", faCircleCheck],
};

const getStage = (stage) => STAGE_MAP[stage] || [0, "Ожидание", faCirclePause];

export default function ApparatReRegistrationPage() {
    const {openNotification} = useAlert();
    const {data: session} = useSession();

    const [dataTable, setDataTable] = useState([]);
    const [dealersOptionRaw, setDealersOptionRaw] = useState([]);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [userNameCache, setUserNameCache] = useState({});

    // --- Логика данных ---
    const getReRegisteredTerminalsList = async () => {
        try {
            const config = {model: "ApparatReRegistrations", sort: '{"column":"updatedAt","direction":"desc"}'};
            const result = await fetchData(config, session);
            setDataTable(result.data || []);
        } catch (e) {
            console.error(e);
        }
    };

    const loadDealers = async () => {
        try {
            const result = await fetchData({model: "Dealer"}, session);
            setDealersOptionRaw(result.data || []);
        } catch (e) {
            console.error(e);
        }
    };

    const handleChangeStatus = async (id, status) => {
        try {
            const response = await fetch(CHANGE_STATUS_RE_REGISTERED_TERMINAL_RECORD_API, {
                method: "POST",
                headers: {"Content-Type": "application/json", Authorization: `Bearer ${session?.accessToken}`},
                body: JSON.stringify([{recordId: id, status, userId: session?.user?.id}]),
            });
            if (response.ok) {
                openNotification({type: "success", message: "Запись обновлена"});
                getReRegisteredTerminalsList();
            }
        } catch (error) {
            openNotification({type: "error", message: "Ошибка обновления"});
        }
    };


    // --- Компоненты ячеек ---
    const StatusCell = ({statusKey, record, justText = false}) => {
        const status = STATUS_MAP[statusKey] || {};
        const [stageNum] = getStage(record.stage);
        const text = (["completed", "cancelled"].includes(statusKey) || stageNum <= 0)
            ? status.label
            : `${status.label} (${stageNum}/13)`;

        return justText ? (
            <div className='d-flex align-items-center me-5 text-nowrap'>
                <FontAwesomeIcon size='lg' className='me-2' icon={status.icon}/>
                <Text>{status.label || '(пусто)'}</Text>
            </div>
        ) : <StatusIndicator text={text} color={status.color} icon={status.icon}/>;
    };

    const tableColumns = [
        {title: "ID", dataIndex: "id", key: "id", sorter: (a, b) => a.id - b.id, ...SearchByColumn("id")},
        {title: "ID терминала", dataIndex: "apparat_id", key: "apparat_id", ...SearchByColumn("apparat_id")},
        {
            title: "Новый ID",
            dataIndex: "new_apparat_id",
            render: (text) => text || <Text type="secondary">(Не создан)</Text>
        },
        {
            title: "Дилер",
            dataIndex: "region_id",
            render: (id) => {
                const d = dealersOptionRaw.find(item => Number(item.id) === Number(id));
                return d ? `${id} ${d.name}` : id;
            }
        },
        {
            title: "Статус",
            dataIndex: "status",
            render: (status, record) => <StatusCell statusKey={status} record={record}/>,
        },
        {title: "Дата создания", dataIndex: "createdAt"},
        {
            key: 'actions',
            render: (_, record) => {
                const [stageNum] = getStage(record.stage);
                const links = {};

                if (['failed', 'cancelled'].includes(record.status)) {
                    links.retry = {
                        label: 'Повторить',
                        icon: faRotateRight,
                        action: (id) => handleChangeStatus(id, 'retry')
                    };
                }
                if (!['failed', 'cancelled', 'paused', 'completed'].includes(record.status)) {
                    links.pause = {
                        label: 'Пауза',
                        icon: faCirclePause,
                        action: (id) => handleChangeStatus(id, 'pause')
                    };
                }
                if (['paused', 'waiting'].includes(record.status)) {
                    links.play = {
                        label: "Продолжить",
                        icon: faCirclePlay,
                        action: (id) => handleChangeStatus(id, 'continue')
                    };
                }
                if (stageNum <= 6 && record.status !== 'cancelled') {
                    if (stageNum === 6 && !record.encashment_terminal) {
                        links.cash = {
                            label: 'Инкассировать',
                            icon: faCreditCard,
                            action: (id) => handleChangeStatus(id, 'encashmentTerminal')
                        };
                    }
                    links.cancel = {
                        label: 'Отменить',
                        icon: faCircleXmark,
                        action: (id) => handleChangeStatus(id, 'cancel')
                    };
                }

                return Object.keys(links).length > 0 && (
                    <div data-clickable="true">
                        <ActionButtons
                            {...record}
                            buttonsLinks={links}
                            dropdownOpen={openDropdownId === record.id}
                            setDropdownOpen={(open) => setOpenDropdownId(open ? record.id : null)}
                        />
                    </div>
                );
            }
        }
    ];

    // --- Рендер раскрывающейся части ---
    const ExpandableContent = ({record}) => {
        const [users, setUsers] = useState({create: '', update: ''});
        const [timeLeft, setTimeLeft] = useState('');

        useEffect(() => {
            const updateTime = () => {
                const remaining = (record.time_out * 1000) - (Date.now() - new Date(record.updatedAt).getTime());
                setTimeLeft(remaining > 0 && record.status === 'waiting' ? humanizeDuration(remaining, {
                    language: 'ru',
                    largest: 2,
                    round: true
                }) : '0 сек');
            };
            updateTime();
            const timer = setInterval(updateTime, 1000);
            return () => clearInterval(timer);
        }, [record]);

        useEffect(() => {
            const load = async () => {
                const c = await getUserFio(record.create_author_id, session);
                const u = await getUserFio(record.update_author_id, session);
                setUsers({create: c, update: u});
            };
            load();
        }, [record]);

        const stage = getStage(record.stage);
        const dealer = dealersOptionRaw.find(d => Number(d.id) === Number(record.region_id));

        const statusItems = [
            {label: 'Статус', children: <StatusCell statusKey={record.status} record={record} justText/>},
            {
                label: `Этап ${stage[0]}/13`,
                children: <div><FontAwesomeIcon icon={stage[2]} className='me-2'/>{stage[1]}</div>
            },
            {label: 'Ошибка', children: record.error_desc || '—'},
            {
                label: 'Попытки', children: (
                    <div className="d-flex align-items-center">
                        {record.retries || 0}/20
                        {record.retries > 0 && !['completed', 'failed'].includes(record.status) && (
                            <Button type="link" size="small"
                                    onClick={() => handleChangeStatus(record.id, 'clearRetries')}>(Сбросить)</Button>
                        )}
                    </div>
                )
            },
            {label: 'Ожидание', children: timeLeft},
            {label: 'Обновлено', children: record.updatedAt},
        ];

        return (
            <div className='m-4'>
                <Descriptions layout="vertical" column={3} title="Статус перерегистрации" items={statusItems}
                              size="small" className="mb-4"/>
                <Descriptions layout="horizontal" column={3} title="Описание" size="small" items={[
                    {label: 'ID терминала', children: record.apparat_id},
                    {label: 'ID нового', children: record.new_apparat_id || '—'},
                    {label: 'Дилер', children: dealer ? `${record.region_id} ${dealer.name}` : record.region_id},
                    {label: 'Создан', children: record.createdAt},
                    {label: 'Автор', children: users.create || '—'},
                    {label: 'Редактор', children: users.update || '—'},
                    {label: 'Инкассация', children: record.encashment_terminal ? 'Авто' : 'Ручная'},
                ]}/>
            </div>
        );
    };

    // --- Эффекты ---
    useEffect(() => {
        loadDealers();
        getReRegisteredTerminalsList();
        const interval = setInterval(() => {
            if (!openDropdownId) getReRegisteredTerminalsList();
        }, 5000);
        return () => clearInterval(interval);
    }, [openDropdownId]);

    return (
        <ProtectedElement allowedPermissions="apparats_managment">
            <Head><title>Перерегистрация | {process.env.NEXT_PUBLIC_APP_NAME}</title></Head>
            <Title level={2}>Перерегистрация терминала</Title>
            <ApparatReRegistrationForm/>
            <SmartTable
                columns={tableColumns}
                data={dealersOptionRaw.length > 0 ? dataTable : []}
                expandableContent={(record) => <ExpandableContent record={record}/>}

            />
        </ProtectedElement>
    );
}
