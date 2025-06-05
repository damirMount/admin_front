import React, {useEffect, useState} from "react";
import {useAlert} from "../../../contexts/AlertContext";
import {useSession} from "next-auth/react";
import UniversalSelect from "../../main/input/UniversalSelect";
import {Alert, Button, Table, Typography} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBan, faExclamationTriangle} from "@fortawesome/free-solid-svg-icons";
import {ADD_TO_TERMINAL_RE_REGISTRATION_QUEUE_API, GET_TERMINALS_LIST_API} from "../../../routes/api";
import fetchData from "../../main/database/DataFetcher";
import SearchByColumn from "../../main/table/cell/SearchByColumn";
import uniqueKeyGenerator from "../../main/system/UniqueKeyGenerator";

const {Title, Text} = Typography;

const ApparatReRegistrationForm = () => {
    const {openNotification} = useAlert();
    const {data: session} = useSession();

    // Сырые списки из API
    const [terminalsOptionRaw, setTerminalsOptionRaw] = useState([]);
    const [dealersOptionRaw, setDealersOptionRaw] = useState([]);

    // Выбранные сущности
    const [selectedTerminals, setSelectedTerminals] = useState([]);
    const [selectedDealer, setSelectedDealer] = useState(null);
    const [validationResults, setValidationResults] = useState([]);
    const [selectorUpdateKey, setSelectorUpdateKey] = useState([])

    // Строки таблицы
    const [dataTable, setDataTable] = useState([]);

    /**
     * Колонки таблицы: ID, ID терминала, плюс поиск по этим полям
     */
    const tableColumns = [
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
            title: "Старый дилер",
            dataIndex: "dealer",
            key: "dealer",
            ...SearchByColumn("dealer"),
        },
        {
            title: "IP",
            dataIndex: "ip",
            key: "ip",
            ...SearchByColumn("ip"),
        },
        {
            title: "Предупреждения и ошибки",
            dataIndex: "errorMessage",
            key: "errorMessage",
        },
    ];

    /**
     * При смене селекта «Терминал»:
     */
    const handleTerminalChange = (selectedValues) => {
        if (!Array.isArray(selectedValues)) return;

        const selectedTerminals = terminalsOptionRaw.filter((terminal) =>
            selectedValues.includes(terminal.id)
        );

        // Теперь selectedTerminals гарантированно массив
        const currentIds = selectedTerminals.map((t) => t.id);
        const newTerminals = selectedTerminals.filter((t) => !currentIds.includes(t.id));

        // Сначала новые, затем уже существующие в том же порядке, что в selectedValues
        const updatedSelected = [
            ...newTerminals,
            ...selectedTerminals.filter((t) => selectedValues.includes(t.id)),
        ];

        const { validation, newRows } = validateTerminals(updatedSelected, selectedDealer, dealersOptionRaw);

        setDataTable(newRows);
        setSelectedTerminals(updatedSelected);
        setValidationResults(validation);
    };

    /**
     * При смене селекта «Дилер»
     */
    const handleDealerChange = (value) => {
        const dealerObj = dealersOptionRaw.find((d) => d.id === value) || null;
        setSelectedDealer(dealerObj);

        if (selectedTerminals) {
            const {validation, newRows} = validateTerminals(selectedTerminals, dealerObj, dealersOptionRaw);

            setDataTable(newRows);
            setValidationResults(validation);
        }
    };

    const validateTerminals = (terminals, selectedDealer, dealersOptionRaw) => {
        const validation = [];
        const newRows = [];

        terminals.forEach( async (terminal) => {
            const dealer = dealersOptionRaw.find((d) => d.id === terminal.id_region);
            let errorMessage;

            if (!terminal.ip) {
                errorMessage = 'Отсутствует ip адрес';
                validation.push({
                    id: terminal.id,
                    type: 'error',
                    message: errorMessage,
                });
            }

            if (terminal.terminal_type !== 1) {
                errorMessage = 'Точка не является терминалом';
                validation.push({
                    id: terminal.id,
                    type: 'error',
                    message: errorMessage,
                });
            }

            if (terminal.blocked !== 0) {
                errorMessage = 'Точка заблокирована';
                validation.push({
                    id: terminal.id,
                    type: 'error',
                    message: errorMessage,
                });
            }

            if (terminal.id_region === selectedDealer?.id) {
                errorMessage = 'Старый дилер терминала совпадает с выбранным дилером на перерегистрацию';
                validation.push({
                    id: terminal.id,
                    type: 'warning',
                    message: errorMessage,
                });
            }

            newRows.push({
                id: terminal.id,
                name: terminal.name,
                ip: terminal.ip,
                errorMessage: errorMessage,
                dealer: dealer ? `${dealer.id} ${dealer.name}` : 'Неизвестно',
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
                            </ul>
                            <Text>Пожалуйста, перепроверьте данные, затем исправьте или удалите ошибочные точки из списка и попробуйте снова.</Text>
                        </div>
                    }

                    type="danger"
                    showIcon
                    className="mb-2 bg-danger-subtle"
                    icon={<FontAwesomeIcon size="lg" className='text-danger' icon={faBan}/>}
                />
            )}
            <div className='d-flex justify-content-between align-items-start mb-5'>
                <div className="d-flex flex-column align-items-center justify-content-between w-50 me-3">

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
                        label="Терминал"
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
                    <Button type="primary" className="mt-2" onClick={addToTerminalQueue}>
                        Добавить в очередь
                    </Button>
                </div>
                <Table
                    size="small"
                    className='w-75 mt-4'
                    bordered
                    columns={tableColumns}
                    pagination={{
                        defaultPageSize: 5,
                        position: 'center',
                        size: 'small'
                    }}
                    dataSource={dataTable}
                    rowClassName={(record) => {
                        const validation = validationResults.find(v =>
                            String(v.id) === String(record.id)
                        );

                        if (!validation) return '';

                        if (validation.type === 'warning') return 'table-row-warning';
                        if (validation.type === 'error') return 'table-row-danger';

                        return '';
                    }}
                />
            </div>


        </>
    )
        ;
};

export default ApparatReRegistrationForm;
