import React, {useEffect, useState} from "react";
import {useAlert} from "../../../contexts/AlertContext";
import {useSession} from "next-auth/react";
import UniversalSelect from "../../main/input/UniversalSelect";
import {Alert, Button, Select, Switch, Table, Typography} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBan, faExclamationTriangle} from "@fortawesome/free-solid-svg-icons";
import {
    ADD_TO_TERMINAL_RE_REGISTRATION_QUEUE_API,
    GET_TERMINALS_LIST_API,
    GET_UNREGISTERED_TERMINALS_LIST_BY_DEALER_API
} from "../../../routes/api";
import fetchData from "../../main/database/DataFetcher";
import SearchByColumn from "../../main/table/cell/SearchByColumn";
import uniqueKeyGenerator from "../../main/system/UniqueKeyGenerator";

const {Title, Text} = Typography;

const ApparatReRegistrationForm = () => {
    const {openNotification} = useAlert();
    const {data: session} = useSession();

    // Сырые списки из API
    const [terminalsOptionRaw, setTerminalsOptionRaw] = useState([]);
    const [unregisteredTerminalsOptionRaw, setUnregisteredTerminalsOptionRaw] = useState([]);
    const [dealersOptionRaw, setDealersOptionRaw] = useState([]);

    // Выбранные сущности
    const [selectedTerminals, setSelectedTerminals] = useState([]);
    const [selectedDealer, setSelectedDealer] = useState(null);
    const [encashmentTerminal, setEncashmentTerminal] = useState(false);
    const [validationResults, setValidationResults] = useState([]);
    const [selectorUpdateKey, setSelectorUpdateKey] = useState([])

    // Строки таблицы
    const [dataTable, setDataTable] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
    });
    /**
     * Колонки таблицы: ID, ID терминала, плюс поиск по этим полям
     */
    const tableColumns = [
        {
            title: '№',
            dataIndex: 'index',
            key: 'index',
            width: 50,
            align: 'center',
            render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,


        },
        {
            title: "ID терминала",
            dataIndex: "id",
            key: "id",
            ...SearchByColumn("id"),
        },
        {
            title: "Название",
            dataIndex: "name",
            key: "name",
            ...SearchByColumn("name"),
        },
        {
            title: "Новый ID терминала",
            dataIndex: "new_apparat_id",
            key: "new_apparat_id",
            render: (_, record) => {
                const selectedNewIds = selectedTerminals
                    .map(t => t.new_apparat_id)
                    .filter(id => id && id !== 'new' && id !== record.new_apparat_id);

                const options = [
                    {
                        value: 'new',
                        label: 'Новая точка',
                        disabled: false,
                    },
                    ...unregisteredTerminalsOptionRaw
                        .filter(item => item.id_region === selectedDealer?.id)
                        .map(item => ({
                            value: item.id,
                            label: `${item.id} ${item.name}`,
                            disabled: selectedNewIds.includes(item.id), // disable если выбран в другой строке
                        })),
                ];

                return (
                    <Select
                        key={record.id}
                        value={record.new_apparat_id || 'new'}
                        style={{width: 150}}
                        allowClear={true}
                        showSearch
                        options={options}
                        onChange={(value) => handleChangeNewTerminalId(record.id, value)}
                    />
                );
            }
        },

        {
            title: "Старый дилер",
            dataIndex: "dealer",
            key: "dealer",
            ...SearchByColumn("dealer"),
        },
        {
            title: "IP адрес",
            dataIndex: "ip",
            key: "ip",
            ...SearchByColumn("ip"),
        },
        {
            title: "Предупреждения и ошибки",
            dataIndex: "errorMessage",
            key: "errorMessage",
            render: (text) => {
                return <ul>
                    {text && text.map((msg, index) => (
                        <li key={index}>{msg}</li>
                    ))}
                </ul>
            }
        },
    ];

    const handleTerminalChange = (selectedValues) => {
        if (!Array.isArray(selectedValues)) return;

        const updatedSelected = selectedValues.map((apparatId) => {
            const existing = selectedTerminals.find((item) => item.apparat_id === apparatId);
            return {
                apparat_id: apparatId,
                new_apparat_id: existing?.new_apparat_id ?? null,
            };
        });

        const {validation, newRows} = validateTerminals(updatedSelected, selectedDealer, dealersOptionRaw);

        setSelectedTerminals(updatedSelected);
        setValidationResults(validation);
        setDataTable(newRows);
    };

    const handleChangeNewTerminalId = (apparatId, newValue) => {
        const updatedTerminals = selectedTerminals.map(terminal => {
            if (terminal.apparat_id === apparatId) {
                return {
                    ...terminal,
                    new_apparat_id: newValue,
                };
            }
            return terminal;
        });

        const {validation, newRows} = validateTerminals(updatedTerminals, selectedDealer, dealersOptionRaw);

        setSelectedTerminals(updatedTerminals);
        setValidationResults(validation);
        setDataTable(newRows);
    };


    /**
     * При смене селекта «Дилер»
     */
    const handleDealerChange = (value) => {
        const dealerObj = dealersOptionRaw.find((d) => d.id === value) || null;
        setSelectedDealer(dealerObj);

        const {validation, newRows} = validateTerminals(selectedTerminals, dealerObj, dealersOptionRaw);

        setValidationResults(validation);
        setDataTable(newRows);
    };

    const handleEncashmentChange = (value) => {
        setEncashmentTerminal(value)
    };

    const validateTerminals = (
        updatedTerminals = [],
        selectedDealer,
        dealersOptionRaw
    ) => {
        const validation = [];
        const newRows = [];

        if (updatedTerminals.length === 0) {
            return {validation, newRows};
        }
        updatedTerminals.forEach(({apparat_id, new_apparat_id}) => {
            const oldTerminal = terminalsOptionRaw.find((t) => t.id === apparat_id);
            const newTerminal = unregisteredTerminalsOptionRaw.find((t) => t.id === new_apparat_id);

            const oldDealer = dealersOptionRaw.find((d) => d.id === oldTerminal?.id_region);
            const newDealer = dealersOptionRaw.find((d) => d.id === newTerminal?.id_region);
            const errors = [];

            if (!oldTerminal) {
                errors.push('Старый терминал не найден');
            } else {
                if (!oldTerminal.ip) {
                    errors.push('Отсутствует IP адрес');
                }

                if (oldTerminal.terminal_type !== 1) {
                    errors.push('Точка не является терминалом');
                }

                if (oldTerminal.blocked !== 0) {
                    errors.push('Точка заблокирована');
                }

                if (oldDealer?.id === selectedDealer?.id) {
                    validation.push({
                        id: apparat_id,
                        type: 'warning',
                        message: 'Старый дилер терминала совпадает с выбранным дилером на перерегистрацию',
                    });
                }
                if (newTerminal && newTerminal !== 'new') {
                    validation.push({
                        id: apparat_id,
                        type: 'warning',
                        message: 'Терминал будет перерегистрирован на существующую точку',
                    });
                }
            }

            if (newTerminal && newDealer && selectedDealer?.id && newDealer.id !== selectedDealer.id || !newTerminal && new_apparat_id && new_apparat_id !== 'new') {
                errors.push(`Точка ${new_apparat_id} не принадлежит выбранному дилеру`);
            }

            // Лог для каждой ошибки
            errors.forEach(message => {
                validation.push({
                    id: apparat_id,
                    type: 'error',
                    message,
                });
            });

            newRows.push({
                id: oldTerminal?.id || apparat_id,
                name: oldTerminal?.name || '-',
                ip: oldTerminal?.ip || '-',
                dealer: oldDealer ? `${oldDealer.id} ${oldDealer.name}` : 'Неизвестно',
                errorMessage: [
                    ...errors,
                    ...validation
                        .filter(v => v.id === apparat_id && v.type === 'warning')
                        .map(v => v.message),
                ],
                new_apparat_id: new_apparat_id || 'new',
            });

        });

        return {validation, newRows};
    };

    /**
     * Добавление в очередь перерегистрации
     */
    const addToTerminalQueue = async () => {
        if (!selectedDealer?.id) {
            openNotification({
                type: "error",
                message: "Выберите терминал, и дилера",
            });
            return;
        }

        if (validationResults.some(v => v.type === 'error')) {
            openNotification({
                type: "error",
                message: "Среди выбранных точек есть те, что содержат в себе ошибку, удалите их из списка на перерегистрацию либо исправьте и попробуйте снова",
            });
            return;
        }

        try {
            const response = await fetch(ADD_TO_TERMINAL_RE_REGISTRATION_QUEUE_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify([
                    {
                        selectedDealerId: selectedDealer.id,
                        selectedTerminals: selectedTerminals,
                        encashmentTerminal: encashmentTerminal,
                        userId: session?.user?.id,
                    },
                ]),
            });

            const result = await response.json();

            if (response.ok) {
                openNotification({
                    type: "success",
                    message: "Терминал добавлен в очередь",
                });
                setSelectedTerminals([])
                setValidationResults([])
                setDataTable([])
                setSelectorUpdateKey(uniqueKeyGenerator())
                // Обновляем таблицу (при необходимости, например, перезагрузкой из БД)
            } else {
                openNotification({type: "error", message: result.resultDescription});
            }
        } catch (error) {
            console.error("Ошибка при добавлении в очередь:", error);
            openNotification({
                type: "error",
                message: "Не удалось добавить терминал в очередь",
            });
        }
    }

    const getUnregisteredTerminalsByDealer = async () => {
        try {
            const response = await fetch(GET_UNREGISTERED_TERMINALS_LIST_BY_DEALER_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify([
                    {
                        selectedDealerId: selectedDealer.id,
                    },
                ]),
            });
            const result = await response.json();
            if (response.ok) {
                setUnregisteredTerminalsOptionRaw(result.data || []);
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

    // 1) Загрузка терминалов
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

    // 2) Загрузка дилеров
    const loadDealers = async () => {
        try {
            const config = {model: "Dealer", sort: '{"column":"id","direction":"asc"}',};
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

    useEffect(() => {
        if (selectedDealer !== null) {
            getUnregisteredTerminalsByDealer()
        }

    }, [selectedDealer])

    /**
     * Загрузка терминалов и дилеров при монтировании
     */
    useEffect(() => {

        loadTerminals();
        loadDealers();
    }, [session, openNotification]);

    return (
        <>
            {validationResults.some(v => v.type === 'warning') && (
                <Alert
                    message={
                        <Title level={5}>
                            Внимание! Обнаружены точки с потенциальными проблемами!
                        </Title>
                    }
                    description={
                        <div className='d-flex flex-column'>
                            <Text>Некоторые выбранные точки содержат недочёты. Их <b>можно</b> отправить на
                                перерегистрацию, но
                                перед этим рекомендуется проверить данные. Возможные причины неисправностей:</Text>
                            <ul>
                                <li>Не заполнены обязательные поля</li>
                                <li>Выбрана перерегистрация на существующую точку</li>
                                <li>Текущий дилер совпадает с новым дилером, на которого планируется регистрация</li>
                            </ul>
                            <Text> Пожалуйста, убедитесь в корректности данных перед дальнейшей операцией.</Text>
                        </div>
                    }
                    type="warning"
                    showIcon
                    className="mb-2 bg-warning-subtle"
                    icon={<FontAwesomeIcon size="lg" icon={faExclamationTriangle}/>
                    }
                />
            )}
            {validationResults.some(v => v.type === 'error') && (
                <Alert
                    message={
                        <Title level={5}>
                            Ошибка! Некоторые точки не могут быть перерегистрированы!
                        </Title>
                    }
                    description={
                        <div className='d-flex flex-column'>
                            <Text>Среди выбранных точек есть те, которые не могут быть отправлены на перерегистрацию.
                                Возможные причины:</Text>
                            <ul>
                                <li>Точка уже находится в очереди на перерегистрацию</li>
                                <li>Точка заблокирована</li>
                                <li>У точки отсутствует ip адрес</li>
                                <li>Точка не является терминалом</li>
                                <li>Новая точка не принадлежит выбранному дилеру</li>
                            </ul>
                            <Text>Пожалуйста, перепроверьте данные, затем исправьте или удалите ошибочные точки из
                                списка и попробуйте снова.</Text>
                        </div>
                    }

                    type="danger"
                    showIcon
                    className="mb-2 bg-danger-subtle"
                    icon={<FontAwesomeIcon size="lg" className='text-danger' icon={faBan}/>}
                />
            )}
            <div className='d-flex justify-content-between align-items-start mb-5 mt-5'>
                <div className="d-flex flex-column align-items-center justify-content-between w-25 me-4">

                    <UniversalSelect
                        label="Новый дилер"
                        placeholder="Выберите дилера"
                        name="dealer_id"
                        selectedOptions={selectedDealer ? [selectedDealer.id] : []}
                        options={dealersOptionRaw
                            .filter((item) => item.blocked === 0)
                            .map((item) => ({
                                value: item.id,
                                label: `${item.id} ${item.name}`,
                            }))
                        }
                        isSearchable
                        required
                        onSelectChange={handleDealerChange}
                    />

                    <UniversalSelect
                        key={JSON.stringify(selectorUpdateKey)}
                        label="Старый терминал"
                        placeholder="Выберите терминал"
                        name="terminal_id"
                        isMulti={true}
                        options={terminalsOptionRaw.map((item) => ({
                            value: item.id,
                            label: `${item.id} ${item.name}`,
                        }))}
                        isSearchable
                        required
                        onSelectChange={handleTerminalChange}
                    />

                    <UniversalSelect
                        label="Тип инкассации"
                        placeholder="Выберите тип инкассации"
                        name="is_collect"
                        firstOptionSelected={true}
                        options={[
                            {value: false, label: 'Ручная инкассация'},
                            {value: true, label: 'Автоматическая'},
                        ]}
                        required
                        onSelectChange={handleEncashmentChange}
                    />
                    <Button type="primary" className="mt-2" onClick={addToTerminalQueue}>
                        Добавить в очередь
                    </Button>
                </div>
                <Table
                    size="small"
                    className='w-75'
                    bordered
                    columns={tableColumns}
                    pagination={pagination}
                    onChange={(pagination) => setPagination(pagination)}
                    dataSource={dataTable}
                    rowClassName={(record) => {
                        const validations = validationResults.filter(v =>
                            String(v.id) === String(record.id)
                        );

                        if (validations.some(v => v.type === 'error')) {
                            return 'table-row-danger';
                        }
                        if (validations.some(v => v.type === 'warning')) {
                            return 'table-row-warning';
                        }

                        return '';
                    }}

                />
            </div>
        </>
    );
};

export default ApparatReRegistrationForm;
