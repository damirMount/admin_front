import {Button, Descriptions, Typography} from "antd";
import React, {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import Head from "next/head";
import ProtectedElement from "../../components/main/system/ProtectedElement";
import fetchData from "../../components/main/database/DataFetcher";
import SmartTable from "../../components/main/table/SmartTable";
import StatusIndicator from "../../components/main/table/cell/StatusIndicator";
import SearchByColumn from "../../components/main/table/cell/SearchByColumn";
import ApparatReRegistrationForm from "../../components/pages/apparat/ApparatReRegistrationForm";
import ActionButtons from "../../components/main/table/cell/ActionButtons";
import {useAlert} from "../../contexts/AlertContext";
import {CHANGE_STATUS_RE_REGISTERED_TERMINAL_RECORD_API} from "../../routes/api";
import {
    faCheckCircle,
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
    faTrashCan,
} from "@fortawesome/free-regular-svg-icons";
import {
    faArrows,
    faArrowUpRightFromSquare,
    faBan,
    faClockRotateLeft,
    faGears, faHashtag,
    faLaptopCode,
    faPercent,
    faRotateRight,
    faSpinner,
    faTriangleExclamation,
    faUserMinus,
} from "@fortawesome/free-solid-svg-icons";
import {faCircleCheck} from "@fortawesome/free-regular-svg-icons/faCircleCheck";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Link from "next/link";
import humanizeDuration from 'humanize-duration';

const {Title, Text} = Typography;

export default function EncashmentsPage() {
    const {openNotification} = useAlert();
    const {data: session} = useSession();

    const [dataTable, setDataTable] = useState([]);
    const [dealersOptionRaw, setDealersOptionRaw] = useState([]);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [openExpandId, setOpenExpandId] = useState(null);
    const [expandedRowKeys, setExpandedRowKeys] = useState([]);
    const [userNameCache, setUserNameCache] = useState({});

    const handleExpand = (expanded, record) => {
        const key = record.key;

        if (expanded) {
            setExpandedRowKeys([key]);
            setOpenExpandId(1)
        } else {
            setExpandedRowKeys([]);
            setOpenExpandId(null)
        }
    };

    const statusMap = {
        completed: {icon: faCheckCircle, label: "Выполнено", color: "success"},
        failed: {icon: faTriangleExclamation, label: "Ошибка", color: "danger"},
        cancelled: {icon: faBan, label: "Отменён", color: "danger"},
        pending: {icon: faClockRotateLeft, label: "В очереди", color: "default"},
        in_progress: {icon: faSpinner, label: "Обрабатывается", color: "primary"},
        paused: {icon: faCirclePause, label: "Приостановлен", color: "gray"},
        waiting: {icon: faHourglassHalf, label: "В ожидании", color: "warning"},
    };

    const stageMap = {
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

    const getStage = (stage) => stageMap[stage] || [0, "Ожидание", faCirclePause];

    const tableColumns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            sorter: (a, b) => a.id - b.id,
            ...SearchByColumn("id"),
        },
        {
            title: "ID терминала",
            dataIndex: "apparat_id",
            key: "apparat_id",
            sorter: (a, b) => a.apparat_id - b.apparat_id,
            ...SearchByColumn("apparat_id"),
        },
        {
            title: "Новый ID терминала",
            dataIndex: "new_apparat_id",
            key: "new_apparat_id",
            sorter: (a, b) => a.new_apparat_id - b.new_apparat_id,
            ...SearchByColumn("new_apparat_id"),
            render: (text) => {
                if (text) {
                    return text;
                } else {
                    return <Text type={"secondary"}>(Ещё не создан)</Text>;
                }
            },
        },
        {
            title: "Дилер",
            dataIndex: "region_id",
            key: "region_id",
            sorter: (a, b) => a.region_id - b.region_id,
            ...SearchByColumn("region_id"),
            render: (text) => {
                const dealer = dealersOptionRaw.find((d) => d.id === text);

                return dealer ? `${text} ${dealer.name}` : text
            }
        },
        {
            title: "Статус",
            dataIndex: "status",
            key: "status",
            sorter: (a, b) => a.status.localeCompare(b.status),
            filters: Object.entries(statusMap).map(([key, value]) => ({
                text: value.label,
                value: key,
            })),
            onFilter: (value, record) => record.status === value,
            render: (statusKey, record) => {
                return <GetStatus statusKey={statusKey} record={record}/>
            },
        },
        {
            title: "Дата создания",
            dataIndex: "createdAt",
            key: "createdAt",
            sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
            ...SearchByColumn("createdAt"),
        },
        {
            title: "Последний запрос",
            dataIndex: "updatedAt",
            key: "updatedAt",
            sorter: (a, b) => a.updatedAt.localeCompare(b.updatedAt),
            ...SearchByColumn("updatedAt"),
        },
        {
            key: 'actions',
            render: (_, record) => {
                const [stageNum] = getStage(record.stage);

                const actionButtonsLinks = {};

                if (['failed', 'cancelled'].includes(record.status)) {
                    actionButtonsLinks.retryRoute = {
                        label: 'Повторить',
                        icon: faRotateRight,
                        useId: true,
                        action: (id) => {
                            handleChangeStatus(id, 'retry')
                        },
                    };
                }

                if (!['failed', 'cancelled', 'paused', 'completed'].includes(record.status)) {
                    actionButtonsLinks.retryRoute = {
                        label: 'Приостановить',
                        icon: faCirclePause,
                        useId: true,
                        action: (id) => {
                            handleChangeStatus(id, 'pause')
                        },
                    };
                }

                if (['paused', 'waiting'].includes(record.status)) {
                    actionButtonsLinks.playRoute = {
                        label: "Продолжить",
                        icon: faCirclePlay,
                        useId: true,
                        action: (id) => {
                            handleChangeStatus(id, 'continue')
                        },
                    };
                }

                if (stageNum <= 6 && record.status !== 'cancelled') {
                    if (stageNum === 6 && !record.encashment_terminal) {
                        actionButtonsLinks.cashEncashment = {
                            label: 'Инкассировать',
                            icon: faCreditCard,
                            useId: true,
                            action: (id) => {
                                handleChangeStatus(id, 'encashmentTerminal')
                            },
                        };
                    }
                    actionButtonsLinks.cancelRoute = {
                        label: 'Отменить',
                        icon: faCircleXmark,
                        useId: true,
                        action: (id) => {
                            handleChangeStatus(id, 'cancel')
                        },
                    };
                }

                if (Object.keys(actionButtonsLinks).length === 0) return null;

                const handleDropdownOpen = (open) => {
                    setOpenDropdownId(open ? record.id : null);
                };

                return (
                    <ActionButtons
                        {...record}
                        buttonsLinks={actionButtonsLinks}
                        dropdownOpen={openDropdownId === record.id}
                        setDropdownOpen={handleDropdownOpen}
                    />
                );
            }
        }
    ];

    const GetStatus = ({statusKey, record, justText = false}) => {
        const status = statusMap[statusKey] || {};
        const [stageNum] = getStage(record.stage);
        const text = (["completed", "cancelled"].includes(statusKey) || stageNum <= 0)
            ? status.label
            : `${status.label} (${stageNum}/13)`;

        if (justText) {
            return (
                <div className='d-flex align-items-center me-5 text-nowrap'>
                    <FontAwesomeIcon size={'lg'} className='me-2' icon={status.icon}/>
                    <Text>{status.label || '(пусто)'}</Text>
                </div>
            )
        } else {
            return <StatusIndicator text={text} color={status.color} icon={status.icon}/>;
        }
    }

    const handleChangeStatus = async (id, status) => {
        try {
            const response = await fetch(CHANGE_STATUS_RE_REGISTERED_TERMINAL_RECORD_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify([
                    {
                        recordId: id,
                        status: status,
                        userId: session?.user?.id,
                    },
                ]),
            });

            const result = await response.json();
            if (response.ok) {
                openNotification({
                    type: "success",
                    message: "Запись обновлена",
                });
                getReRegisteredTerminalsList()

            } else {
                openNotification({type: "error", message: result.resultDescription});
            }
        } catch (error) {
            openNotification({
                type: "error",
                message: "Не удалось обновить запись",
            });
        }
    }

    const expandedRowRender = (record) => {
        return <ExpandedRow record={record}/>;
    };

    const handleRowClick = (event, record) => {
        const isClickableElement = event.target.closest('[data-clickable="true"]');
        if (!isClickableElement) {
            handleExpand(!expandedRowKeys.includes(record.key), record);
        }
    };

    const getReRegisteredTerminalsList = async () => {
        try {
            const config = {
                model: "ApparatReRegistrations",
                sort: '{"column":"updatedAt","direction":"desc"}',
            };
            const result = await fetchData(config, session);
            setDataTable(result.data || []);
        } catch (e) {
            console.log(e)
        }
    };

    const loadDealers = async () => {
        try {
            const config = {model: "Dealer"};
            const result = await fetchData(config, session);
            setDealersOptionRaw(result.data || []);
        } catch (error) {
            console.error("Ошибка при загрузке дилеров:", error);
            openNotification({
                type: "error",
                message: `Не удалось загрузить список дилеров: ${error.message}`,
            });
        }
    };

    const getUser = async (userId) => {
        if (userId === null) {
            return false
        }

        if (userNameCache[userId]) {
            return userNameCache[userId];
        }

        try {
            const config = {model: "User", searchTerm: {id: userId}};
            const result = await fetchData(config, session);

            setUserNameCache(prev => ({
                ...prev,
                [userId]: result.data[0]?.fio, // или data.fullName / data.username
            }));
            return result.data[0]?.fio

        } catch (error) {
            console.error("Ошибка при загрузке пользователя:", error);
            openNotification({
                type: "error",
                message: `Не удалось загрузить пользователя: ${error.message}`,
            });
        }
    };

    const ExpandedRow = ({record}) => {
        const [createUser, setCreateUser] = useState(null);
        const [updateUser, setUpdateUser] = useState(null);
        const [timeLeft, setTimeLeft] = useState('');

        const stage = getStage(record.stage);
        const dealer = dealersOptionRaw.find((d) => d.id === record.region_id);


        const dealerName = `${record.region_id} ${dealer.name}`

        const formatTimeLeft = () => {
            const now = Date.now();
            const lastTime = new Date(record.updatedAt).getTime();
            const passedMs = now - lastTime;
            const timeoutMs = record.time_out * 1000;
            const remainingMs = timeoutMs - passedMs;

            if (remainingMs <= 0 || record.status !== 'waiting') {
                setTimeLeft('0 секунд');
            } else {
                setTimeLeft(
                    humanizeDuration(remainingMs, {
                        language: 'ru',
                        largest: 2,
                        round: true,
                        units: ['h', 'm', 's'],
                        spacer: ' ',
                    })
                );
            }
        };

        useEffect(() => {
            formatTimeLeft(); // сразу при монтировании

            const interval = setInterval(formatTimeLeft, 1000);
            return () => clearInterval(interval);
        }, [record.updatedAt, record.time_out]);

        useEffect(() => {
            const fetchUsers = async () => {
                const createUser = await getUser(record.create_author_id);
                const updateUser = await getUser(record.update_author_id);
                setCreateUser(createUser);
                setUpdateUser(updateUser);
            };
            fetchUsers();
        }, [record]);


        const itemsDesc = [
            {
                label: 'ID терминала',
                children: record.apparat_id ? (
                    <div className="d-flex align-items-center text-black">
                        <Link
                            className='text-black'
                            href={`https://kg.quickpay.kg/idx.php/terminal/edit/index/id/${record.apparat_id}`}
                            target="_blank"
                        >
                            <Text>{record.apparat_id}</Text>
                            <FontAwesomeIcon size="sm" className="ms-2" icon={faArrowUpRightFromSquare}/>
                        </Link>
                    </div>
                ) : (
                    '(Пусто)'
                )
            },
            {
                label: 'ID нового терминала', children: record.new_apparat_id ? (
                    <div className="d-flex align-items-center text-black">
                        <Link
                            className='text-black'
                            href={`https://kg.quickpay.kg/idx.php/terminal/edit/index/id/${record.new_apparat_id}`}
                            target="_blank"
                        >
                            <Text>{record.new_apparat_id}</Text>
                            <FontAwesomeIcon size="sm" className="ms-2" icon={faArrowUpRightFromSquare}/>
                        </Link>
                    </div>
                ) : (
                    '(Пусто)'
                )
            },
            {label: 'Дилер', children: dealerName || '(пусто)'},
            {label: 'Запрос создан', children: record.createdAt || '(пусто)'},
            {label: 'Создал запрос', children: createUser || '(пусто)'},
            {label: 'Последнее изменение', children: updateUser || '(пусто)'},
            {
                label: 'Тип инкассации',
                children: record.encashment_terminal ? 'Автоматическая инкассация' : 'Ручная инкассация'
            },
        ];

        const statusDesc = [
                {
                    label: 'Статус',
                    children: <GetStatus statusKey={record.status} record={record} justText={true}/> || '(пусто)'
                },
                {
                    label: `Этап ${stage[0]} из 13`, children: (
                        <div className='d-flex align-items-center text-nowrap me-5'>
                            <FontAwesomeIcon size={'lg'} className='me-2' icon={stage[2]}/>
                            <Text>{stage[1] || '(пусто)'}</Text>
                        </div>
                    )
                },
                {
                    label: 'Описание ошибки', children: record.error_desc || '(пусто)'
                },
                {
                    label: 'Количество попыток', children: (
                        <div className='d-flex align-items-start text-nowrap me-5'>
                            <Text>{`${record.retries || 0} из 20` || '(пусто)'}</Text>
                            {!['completed', 'failed', 'cancelled'].includes(record.status) && record.retries > 0 && (
                                <Button onClick={() => handleChangeStatus(record.id, 'clearRetries')}
                                        className='ms-1 p-0 align-text-top' type='link'>(Сбросить)</Button>
                            )}
                        </div>
                    )
                },
                {
                    label: 'Время ожидания след. запроса', children: (<Text>{timeLeft}</Text>)
                },
                {
                    label: 'Последний запрос', children:
                        record.updatedAt || '(пусто)'
                },
            ]
        ;

        return (
            <div className='m-4'>
                <Descriptions layout="vertical" className='mb-4 d-flex flex-column justify-content-between w-100'
                              size="small" column={3} title="Статус перерегистрации"
                              items={statusDesc}/>
                <Descriptions layout="horizontal" size="small" column={3} title="Описание" items={itemsDesc}/>
            </div>
        );
    };

    useEffect(() => {
        const getData = async () => {
            if (openDropdownId !== null || openExpandId !== null) return; // Не обновляем, если открыт dropdown
            await getReRegisteredTerminalsList();
        };

        getData(); // первый вызов

        const interval = setInterval(getData, 5000);

        return () => clearInterval(interval);
    }, [openDropdownId, openExpandId]);

    useEffect(() => {
        loadDealers()
    }, [])

    return (
        <ProtectedElement allowedPermissions="apparats_managment">
            <Head>
                <title>Перерегистрация терминала | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>

            <Title level={2}>Перерегистрация терминала</Title>

            <SmartTable
                expandable={{
                    expandedRowRender,
                    expandedRowKeys,
                    onExpand: handleExpand
                }}
                size={"small"}
                columns={tableColumns}
                data={dataTable}
                onRow={(record) => ({
                    onClick: (event) => handleRowClick(event, record),
                })}
            />
        </ProtectedElement>
    );
}
