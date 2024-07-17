import React, {useRef, useState} from "react";
import {Divider, Empty, Input, InputNumber, Popconfirm, Select, Tooltip, Tour} from "antd";
import SmartTable from "../../main/table/SmartTable";
import UniversalSelect from "../../main/input/UniversalSelect";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEnvelope, faQuestionCircle} from "@fortawesome/free-regular-svg-icons";
import {faPlus, faXmark} from "@fortawesome/free-solid-svg-icons";
import {value} from "lodash/seq";
import FormInput from "../../main/input/FormInput";
import RegistryFileFormat from "./RegistryFileFormat";
import {cloneDeep} from "lodash";
import FieldTypeCell from "../../main/table/cell/FieldTypeCell";
import ServiceByServerSelect from "../../main/input/ServiceByServerSelect";

const RegistryForm = ({oldFormData = [], formData = [], onDataFieldsChange}) => {
    const [tourOpen, setTourOpen] = useState(false);
    const [selectedRowKey, setSelectedRowKey] = useState(null);
    const [activeInput, setActiveInput] = useState(false);
    const [addFieldVariant, setAddFieldVariant] = useState('new_row');
    const [selectedServer, setSelectedServer] = useState()

    const refName = useRef(null);
    const refStatus = useRef(null);
    const refSendType = useRef(null);
    const refFormat = useRef(null);
    const refServerAndServices = useRef(null);
    const refTable = useRef(null);
    const refField = useRef(null);
    const refFieldName = useRef(null);
    const refFieldNameDbf = useRef(null);
    const refRegularValue = useRef(null);
    const refRowWidth = useRef(null);
    const refAddNewRow = useRef(null);


    const defaultFields = [
        {
            field: 'id',
            name: 'Номер платежа',
            nameDbf: 'KOD_TR',
            formatDbf: 'N',
            regularValue: '',
            regularValueType: 'value',
            regularValueList: [],
            charNumber: '9',
        },
        {
            field: 'identifier',
            name: 'Лицевой счёт',
            nameDbf: 'KOD',
            formatDbf: 'C',
            regularValue: '',
            regularValueType: 'value',
            regularValueList: [],
            charNumber: '16',
        },
        {
            field: 'real_pay',
            name: 'Сумма платежа',
            nameDbf: 'SUM',
            formatDbf: 'N',
            regularValue: '',
            regularValueType: 'value',
            regularValueList: [],
            charNumber: '6',
        },
        {
            field: 'time_proc',
            name: 'Дата оплаты',
            nameDbf: 'D_TR',
            formatDbf: 'D',
            regularValue: '',
            regularValueType: 'value',
            regularValueList: [],
            charNumber: '20'
        },
        {
            field: 'account.fio',
            name: 'ФИО',
            nameDbf: 'FIO',
            formatDbf: 'C',
            regularValue: '',
            regularValueType: 'value',
            regularValueList: [],
            charNumber: '30'
        },
        {
            field: 'id_apparat',
            name: 'ID терминала',
            nameDbf: 'OTD_TR',
            formatDbf: 'N',
            regularValue: '',
            regularValueType: 'value',
            regularValueList: [],
            charNumber: '8'
        },
        {
            field: 'id_service',
            name: 'Сервисы',
            nameDbf: 'SERVICE',
            formatDbf: 'C',
            regularValue: '',
            regularValueType: 'list',
            regularValueList: [],
            charNumber: '30'
        },
    ]


    const tourSteps = [
        {
            title: 'Название',
            description: <p> Это название файла реестра, которое помогает идентифицировать, какой реестр относится к
                какому
                поставщику. Оно также используется при создании файлов реестров.
                <br/>
                Шаблон формирования названия файла следующий:
                <br/>
                [Название реестра] Название_услуги Дата_реестра формат.
                <br/>
                Например: [ГУ_клиническая_больница_УДППКР]_Стационар_2024-06-06.xlsx</p>,
            target: () => refName.current,
        },
        {
            title: 'Статус',
            description: 'Статус реестра определяет, следует ли отправлять данные по этому реестру или нет.',
            target: () => refStatus.current,
        },
        {
            title: 'Тип отправки',
            description: <p>Существуют два метода отправки данных: по услугам и по серверу.:
                <br/>
                <span className='fw-bold'>По услугам</span>: При выборе отправки по услугам,
                вы указываете конкретную услугу, для которой хотите отправить реестр. Для каждой выбранной услуги будет
                создаваться отдельный файл.
                <br/>
                <span className='fw-bold'>По серверу</span>: При выборе отправки по серверу, все данные будут
                генерироваться в одном файле, без разделения по услугам.</p>,
            target: () => refSendType.current,
        },
        {
            title: 'Формат файлов',
            description: 'Здесь вы выбираете в каком формате вы хотите чтобы генерировался реестр. Вы можете выбрать ' +
                'как один формат так и всё сразу. Учтите для каждого формата вам необходимо будет заполнять свои поля ' +
                'в таблице ниже',
            target: () => refFormat.current,
        },
        {
            title: 'Сервер и услуги',
            description: 'Здесь вы можете выбрать сервер и услуги по которым по которым будут отправляться реестры. ' +
                'В случаи если в "Типе отправки" вы указали отправку по серверу вам нужно будет выбрать только сервер. ' +
                'В другом случаи вы также сможете выбрать по каким конкретно услугам вы хотите получать данные',
            target: () => refServerAndServices.current,
        },
        {
            title: 'Настройка отображение данных в реестре',
            description: 'Эта таблица позволяет настроить, как будут отображаться данные в реестре. Для этого необходимо ' +
                'добавить заголовки, по которым данные будут распределяться. Каждый заголовок требует индивидуальной ' +
                'настройки, которая может изменяться в зависимости от выбранного формата реестра.',
            target: () => refTable.current,
        },
        {
            title: 'Поле в базе',
            description: 'Укажите здесь поле из базы, из которой вы хотите получить данные. ' +
                'Данное поле не обязательно заполнять в случаях когда вы указали значение в поле "Стандартное значение". ' +
                'Во всех остальных случаях это поле обязательно к заполнению',
            target: () => refField.current,
        },
        {
            title: 'Название поля',
            description: 'Здесь вы указываете названия столбца в реестре. Данное поле заполняется только если вы ' +
                'используете формат файла XLSX или CSV. Это поле обязательно для заполнения',
            target: () => refFieldName.current,
        },
        {
            title: 'Название поля для DBF',
            description: 'В данном поле вы также указываете название столбца в реестре, только уже для DBF файла. ' +
                'Учтите что количество символов в DBF файле ограничено. Вы можете ввести либо 10 символов на английском, ' +
                'либо 5 символом на русском. Это поле обязательно для заполнения',
            target: () => refFieldNameDbf.current,
        },
        {
            title: 'Ширина поля',
            description: <p>Здесь вы указываете какой ширины будет поле в файле. Это актуально только для XLSX и DBF
                файлов.
                <br/>
                ВНИМАНИЕ! Для DBF файла этот параметр очень важен, он необходим для отображения данных, в файле.
                Указываете значение с запасом, ведь если указать меньше чем
                необходимо, данные в реестре не будут отображены полностью.</p>,
            target: () => refRowWidth.current,
        },
        {
            title: 'Значение по умолчанию',
            description: 'Здесь вы можете установить значение по умолчанию для данного поля. ' +
                'Существует два вида значений по умолчанию: простое значение и список значений. ' +
                'Когда вы устанавливаете простое значение, оно будет применяться ко всем пустым полям. В случае списка ' +
                'вы можете указать конкретные значения, которые будут заменяться на другие. Остальные значения, ' +
                'не указанные в списке, останутся неизменными.',
            target: () => refRegularValue.current,
        },
        {
            title: 'Новое поле',
            placement: 'top',
            description: 'Также у вас имеется возможность добавлять новые поля в реестр! Вы можете выбрать один из ' +
                'доступных шаблонов из списка либо же добавить полностью пустое поле.',
            target: () => refAddNewRow.current,
        },
    ];

    const handleDelete = (key) => {
        const newData = formData;
        newData.fields = formData.fields.filter((item) => item.key !== key);
        onDataFieldsChange(newData);
    };
    const handleTableInputChange = (value, record, name) => {
        const newData = cloneDeep(formData)


        newData.fields = formData.fields.map(item => {
            if (item.key === record.key) {
                return {...item, [name]: value};
            }
            return item;
        });
        onDataFieldsChange(newData);
    };

    const handleAdditionalFieldChange = (event) => {
        const {name, value} = event.target;
        const newData = cloneDeep(formData);
        let fieldExists = false;

        // Обновляем существующие поля или добавляем новые
        newData.additional_fields = newData.additional_fields.map(item => {
            if (item.hasOwnProperty(name)) {
                fieldExists = true;
                return {...item, [name]: value};
            }
            return item;
        });

        if (!fieldExists) {
            newData.additional_fields.push({[name]: value});
        }

        onDataFieldsChange(newData);
    };


    const handleInputChange = (event) => {
        const {name, value} = event.target;
        const newData = cloneDeep(formData)
        newData[name] = value
        onDataFieldsChange(newData);
    };

    const handleSelectorChange = (valuesArray, name) => {
        const newData = cloneDeep(formData)
        newData[name] = valuesArray
        onDataFieldsChange(newData);
    };

    const updateRowToFormData = (value) => {
        const newData = cloneDeep(formData);
        newData.fields = value;
        onDataFieldsChange(newData);
    };

    const handleRowSelect = (record) => {
        if (!activeInput) {
            setSelectedRowKey(record.key); // Устанавливать выбранный ключ строки при наведении, если нет активного инпута
        }
    };

    const addRow = () => {
        // Глубокое клонирование объекта formData
        const newData = cloneDeep(formData);

        // Проверяем, есть ли элементы в defaultFields, удовлетворяющие условию
        const matchingItems = defaultFields.filter(item => item.field === addFieldVariant);

        // Если есть совпадающие элементы, добавляем их в newData
        if (matchingItems.length > 0) {
            newData.fields.push(...matchingItems);
        } else {
            // Если нет совпадающих элементов, добавляем объект со значениями по умолчанию
            newData.fields.push({
                field: 'account.',
                name: '',
                nameDbf: '',
                formatDbf: 'C',
                regularValue: '',
                regularValueType: 'value',
                regularValueList: [],
                charNumber: '20',
            });
        }
        setAddFieldVariant('new_row');
        // Вызываем функцию обновления данных, передавая ей новые данные
        onDataFieldsChange(newData);
    };

    function transformValue(type) {
        switch (type) {
            case 'C':
                return 'CHAR';
            case 'N':
                return 'NUMERIC';
            case 'F':
                return 'FLOAT';
            case 'Y':
                return 'CURRENCY';
            case 'I':
                return 'INTEGER';
            case 'L':
                return 'LOGICAL';
            case 'D':
                return 'DATE';
            case 'T':
                return 'DATETIME';
            case 'B':
                return 'DOUBLE';
        }
    }

    const tableColumns = [
        {
            key: 'sort'
        },
        {
            title: <span ref={refField}>Поле в базе</span>,
            dataIndex: 'field',
            className: 'col-2 text-nowrap',
            render: (text, record) => {
                if (record.key === selectedRowKey) {
                    return <Input
                        defaultValue={text}
                        disabled={formData && formData.fields && !formData.formats.length > 0}
                        placeholder="(Пусто)"
                        onChange={(event) => handleTableInputChange(event.target.value, record, 'field')}
                        onFocus={() => setActiveInput(record.key)}
                        onBlur={() => setActiveInput(null)}
                    />;
                }
                return (
                    <span className={
                        oldFormData.fields.some(filedValue => filedValue.key === record.key && filedValue.field === text)
                            ? '' : 'fst-italic text-decoration-underline'
                    }>
                        {text ? <b>{text}</b> :
                            <span className="text-secondary">(Пусто)</span>
                        }
                    </span>
                )
            },
        },
        {
            title: <span ref={refFieldName}>Название поля</span>,
            dataIndex: 'name',
            className: 'col-3 text-nowrap',
            render: (text, record) => {
                if (record.key === selectedRowKey) {
                    return <Input
                        defaultValue={text}
                        placeholder={'(Пусто)'}
                        disabled={
                            formData && formData.fields && !formData.formats.some(format => ['xlsx', 'csv']
                                .includes(format))
                        }
                        onChange={(event) => handleTableInputChange(event.target.value, record, 'name')}
                        onFocus={() => setActiveInput(record.key)}
                        onBlur={() => setActiveInput(null)}
                    />;
                }
                return (
                    <span className={
                        oldFormData.fields.some(filedValue => filedValue.key === record.key && filedValue.name === text)
                            ? '' : 'fst-italic text-decoration-underline'
                    }>
                        {text ? text : <span className="text-secondary">(Пусто)</span>
                        }
                    </span>
                )
            },
        },
        {
            title: <span ref={refFieldNameDbf}>Название поля для DBF</span>,
            dataIndex: 'nameDbf',
            className: 'col-3 text-nowrap',
            render: (text, record) => {
                if (record.key === selectedRowKey) {
                    return (
                        <div className='d-flex w-100'>
                            <Input
                                rootClassName='w-50'
                                defaultValue={text}
                                placeholder={'(Пусто)'}
                                disabled={formData && formData.fields && !formData.formats.includes('dbf')}
                                maxLength={10}
                                onChange={(event) => handleTableInputChange(event.target.value, record, 'nameDbf')}
                                onFocus={() => setActiveInput(record.key)}
                                onBlur={() => setActiveInput(null)}
                            />
                            <Tooltip title='Формат DBF'>
                                <Select
                                    className='ms-2 w-50'
                                    placeholder='пусто'
                                    defaultValue={record.formatDbf || 'C'}
                                    disabled={formData && formData.fields && !formData.formats.includes('dbf')}
                                    onChange={(value) => {
                                        setActiveInput(null);
                                        handleTableInputChange(value, record, 'formatDbf');
                                    }}
                                    onFocus={() => setActiveInput(record.key)}
                                    onBlur={() => setActiveInput(null)}
                                    options={[
                                        {value: 'C', label: 'CHAR'},
                                        {value: 'N', label: 'NUMERIC'},
                                        {value: 'D', label: 'DATE'},
                                    ]}
                                />
                            </Tooltip>
                        </div>
                    )
                }
                return (
                    <span className={
                        oldFormData.fields.some(filedValue => filedValue.key === record.key && filedValue.nameDbf === text
                            && filedValue.formatDbf === record.formatDbf)
                            ? '' : 'fst-italic text-decoration-underline'
                    }>
                        <span className='d-flex justify-content-between w-100'>
                            {text ? (
                                <span>{text}</span>
                            ) : (
                                <span className="text-secondary">(Пусто)</span>
                            )}
                            <small className='fw-bold'>{
                                transformValue(record.formatDbf || 'C')}</small>
                            </span>
                        </span>
                )
            },
        },
        {
            title: <span ref={refRowWidth}>Ширина поля</span>,
            dataIndex: 'charNumber',
            className: 'col-1 text-center',
            render: (text, record) => {
                if (record.key === selectedRowKey) {
                    return <InputNumber
                        value={text || 1}
                        disabled={
                            formData && formData.fields && !formData.formats.some(format => ['xlsx', 'dbf']
                                .includes(format))
                        }
                        required={true}
                        min={1}
                        max={255}
                        changeOnWheel={true}
                        onChange={(value) => {
                            if (value <= 1 || value == null) {
                                value = 1;
                            }
                            handleTableInputChange(value, record, 'charNumber');
                        }}
                        onFocus={() => setActiveInput(record.key)}
                        onBlur={() => setActiveInput(null)}
                    />;
                }
                return (
                    <span className={
                        oldFormData.fields.some(filedValue => filedValue.key === record.key && filedValue.charNumber === text)
                            ? '' : 'fst-italic text-decoration-underline'
                    }>
                        {text}
                    </span>
                )

            },
        },
        {
            title: <span ref={refRegularValue}>Значение по умолчанию</span>,
            dataIndex: 'regularValue',
            className: 'col-3 text-center',
            render: (text, record) => {
                return <FieldTypeCell
                    record={record}
                    text={text}
                    data={formData}
                    oldFormData={oldFormData}
                    selectedRowKey={selectedRowKey}
                    setActiveInput={setActiveInput}
                    onChange={onDataFieldsChange}
                />

            },
        },
        {
            title:
                <Tooltip placement="topRight" title="Помощь">
                    <button className="btn color-purple" type='button' onClick={() => setTourOpen(true)}>
                        <FontAwesomeIcon icon={faQuestionCircle} size="lg"/>
                    </button>
                </Tooltip>,
            className: 'text-center',
            render: (text, record) =>
                <Popconfirm placement="topLeft"
                            disabled={formData && formData.fields && formData.fields.length <= 1 && true}
                            title="Вы уверены что хотите удалить это поле?"
                            onConfirm={() => handleDelete(record.key)}>
                    <Tooltip placement="topRight"
                             title={formData && formData.fields && formData.fields.length <= 1 ? 'Невозможно удалить.' +
                                 ' В таблице должна быть минимум 1 поле' : 'Удалить поле'}>
                        <button type="button" className="btn btn-light color-purple border">
                            <FontAwesomeIcon icon={faXmark}/>
                        </button>
                    </Tooltip>
                </Popconfirm>

        }
    ]

    const getFieldsOptionsList = () => {
        let options = []
        try {
            const dataFields = formData.fields.map(dataItem => dataItem.field);
            options = defaultFields.filter(defaultItem => !dataFields.includes(defaultItem.field))
                .map(item => ({
                    value: item.field,
                    label: item.name
                }))
            options.push({
                value: 'new_row',
                label: 'Пустое поле'
            })
        } catch (error) {
            console.log(error)
        }

        return options
    }


    return (
        <>
            <Tour open={tourOpen} onClose={() => setTourOpen(false)} steps={tourSteps}/>
            <div className=" d-flex w-100">
                <div className="d-flex flex-column w-50 mt-4 me-2 justify-content-between">
                    <div className="d-flex flex-column">
                        <div ref={refName} className='d-flex align-items-center justify-content-between'>
                            <h5 className='me-2 w-50'>Название:</h5>
                            <FormInput
                                type="text"
                                className="input-field"
                                id="name"
                                name="name"
                                placeholder="Название"
                                defaultValue={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div ref={refStatus} className='d-flex align-items-center justify-content-between'>
                            <h5 className='me-2 w-50'>Статус:</h5>
                            <UniversalSelect
                                name='is_blocked'
                                placeholder="Укажите статус файла реестра"
                                onSelectChange={handleSelectorChange}
                                firstOptionSelected
                                required
                                selectedOptions={[formData.is_blocked]}
                                isSearchable={false}
                                options={[
                                    {value: false, label: 'Активен'},
                                    {value: true, label: 'Отключён'},
                                ]}
                            />
                        </div>
                        <div ref={refSendType} className='d-flex align-items-center justify-content-between'>
                            <h5 className='me-2 w-50'>Тип отправки:</h5>
                            <UniversalSelect
                                name='send_type'
                                placeholder="Укажите статус файла реестра"
                                onSelectChange={handleSelectorChange}
                                firstOptionSelected
                                required
                                selectedOptions={[formData.send_type]}
                                isSearchable={false}
                                options={[
                                    {value: 1, label: 'По услугам'},
                                    {value: 2, label: 'По серверу'},
                                ]}
                            />
                        </div>
                        <div ref={refFormat} className='d-flex align-items-center justify-content-between'>
                            <h5 className='me-2 w-50'>Формат файлов:</h5>
                            <RegistryFileFormat
                                formData={formData}
                                setFormData={onDataFieldsChange}
                            />
                        </div>
                        {formData.createdAt || formData.updatedAt ? (
                            <>
                                <Divider/>
                                <div className='d-flex align-items-center justify-content-between'>
                                    <h6>Создано:</h6>
                                    <h6>{formData.createdAt ||
                                        <span className="text-secondary">(Дата отсутствует)</span>
                                    } - {
                                        formData.create_author ||
                                        <span className="text-secondary">(Имя отсутствует)</span>
                                    }
                                    </h6>
                                </div>
                                <div className='d-flex align-items-center justify-content-between'>
                                    <h6>Обновлено:</h6>
                                    <h6>{formData.updatedAt ||
                                        <span className="text-secondary">(Дата отсутствует)</span>
                                    } - {
                                        formData.update_author ||
                                        <span className="text-secondary">(Имя отсутствует)</span>
                                    }
                                    </h6>
                                </div>
                            </>
                        ) : null}

                    </div>
                </div>
                <div ref={refServerAndServices} className='d-flex flex-column w-50 ms-2'>
                    <UniversalSelect
                        name='server_id'
                        label="Сервер"
                        placeholder="Выберете сервер"
                        fetchDataConfig={{
                            model: 'Server',
                        }}
                        selectedOptions={[formData.server_id]}
                        onSelectChange={(selectedValue, name) => {
                            handleSelectorChange(selectedValue, name);
                            setSelectedServer(selectedValue);
                        }}
                        required
                    />
                    {selectedServer ? (
                        <>
                            {formData.send_type === 1 ? (
                                <ServiceByServerSelect
                                    selectedServer={selectedServer}
                                    selectedService={formData.services_id}
                                    onChange={handleSelectorChange}
                                />
                            ) : (
                                <div
                                    className='d-flex user-select-none opacity-25 flex-column justify-content-center
                                    align-items-center h-100'>
                                    <FontAwesomeIcon icon={faEnvelope} size={'2xl'}/>
                                    <h5>Отправка по серверу</h5>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className='d-flex flex-column justify-content-center align-items-center h-100'>
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                        </div>
                    )}

                </div>

            </div>
            <div ref={refTable}>

                <SmartTable
                    columns={tableColumns}
                    rowClassName="user-select-none"
                    data={formData.fields.length > 0 ? formData.fields : defaultFields}
                    onUpdateData={updateRowToFormData}
                    onRow={(record) => ({
                        onClick: () => handleRowSelect(record),
                        onMouseEnter: () => handleRowSelect(record),
                        onMouseLeave: () => {
                            if (!activeInput) {
                                setSelectedRowKey(null);
                            }
                        }

                    })}
                    paginationPosition={['none']}
                />
            </div>
            <div className="d-flex w-100 justify-content-between align-items-center ">
                <div className=' mt-3 d-flex align-items-center'>
                    <Tooltip placement="bottom" title='Название поля с итоговой суммой'>
                        <div>
                            <FormInput
                                type="text"
                                className="input-field"
                                id="totalpayFieldName"
                                name="totalpayFieldName"
                                defaultValue={formData.additional_fields[0].totalpayFieldName || 'ИТОГО:'}
                                onChange={handleAdditionalFieldChange}
                                required
                            />
                        </div>
                    </Tooltip>
                </div>
                <div ref={refAddNewRow} className='w-25 mt-3 d-flex align-items-center'>
                    <Select
                        key={addFieldVariant}
                        size='large'
                        className="w-100"
                        defaultValue={addFieldVariant}
                        onChange={setAddFieldVariant}
                        options={getFieldsOptionsList()}
                    />
                    <Tooltip placement="bottom" title='Добавить поле'>
                        <button className="btn btn-purple ms-2 text-nowrap" type="button" onClick={addRow}>
                            <FontAwesomeIcon icon={faPlus}/>
                        </button>
                    </Tooltip>
                </div>
            </div>
        </>
    );
};

export default RegistryForm;
