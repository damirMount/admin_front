// pages/index.js
import React, {useEffect, useState} from 'react';
import Head from 'next/head';
import {REGISTRY_DELETE_API} from "../../routes/api";
import StatusIndicator from "../../components/main/table/cell/StatusIndicator";
import UniversalSelect from "../../components/main/input/UniversalSelect";
import Link from "next/link";
import {REGISTRY_CREATE_URL, REGISTRY_EDIT_URL} from "../../routes/web";
import {ColorPicker, DatePicker} from "antd";
import ActionButtons from "../../components/main/table/cell/ActionButtons";
import FileFormats from "../../components/main/table/cell/FileFormats";
import ServerAndServiceCountCell from "../../components/main/table/cell/ServerAndServiceCountCell";
import SearchByColumn from "../../components/main/table/cell/SearchByColumn";
import SmartTable from "../../components/main/table/SmartTable";
import {useAlert} from "../../contexts/AlertContext";
import ProtectedElement from "../../components/main/system/ProtectedElement";
import FormInput from "../../components/main/input/FormInput";
import ChartArea from "../../components/main/charts/ChartArea";

export default function TestPage() {
    const {openNotification, openConfirmAction, closeConfirmAction} = useAlert();
    const [formData, setFormData] = useState({
        name: '',
        value1: '',
        value2: '',
        formats: [],
        is_blocked: '',
    });
    const [updatedFormData, setUpdatedFormData] = useState({...formData});
    const [color, setColor] = useState('darkblue');

    const actionButtonsLinks = {
        editRoute: {label: 'Изменить запись', link: REGISTRY_EDIT_URL, useId: true},
        deleteRoute: {label: 'Удалить', link: REGISTRY_DELETE_API, useId: true},
    };

    const options = [
        {value: '11001', label: 'Выбрать все записи', isSelectOne: true},
        {value: 'strawberry', label: 'Strawberry'},
        {value: 'vanilla', label: 'Vanilla'}
    ]

    const fetchDataConfig = {
        model: 'Registry',
        sort: '{"column":"id","direction":"desc"}',
    };

    const handleSelectorChange = (valuesArray, name) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: valuesArray,
        }));
    };


    const tableColumns = [
        {
            key: 'sort'
        },
        {
            title: 'ID',
            dataIndex: 'id',
            sorter: (a, b) => a.id - b.id,
            ...SearchByColumn('id'),
        },
        {
            title: 'Название',
            dataIndex: 'name',
            className: 'col-10',
            sorter: (a, b) => a.name.localeCompare(b.name),
            ...SearchByColumn('name'),
        },
        {
            title: 'Статус',
            dataIndex: 'is_blocked',
            filters: [
                {
                    text: 'Активен',
                    value: false,
                },
                {
                    text: 'Отключён',
                    value: true,
                },
            ],
            onFilter: (value, record) => record.is_blocked === value,
            render: (text) => StatusIndicator(text),
        },
        {
            title: 'Сервер',
            dataIndex: 'server_id',
            className: 'col-2',
            ...SearchByColumn('server_id'),
            sorter: (a, b) => a.server_id - b.server_id,
            render: (text, record) => ServerAndServiceCountCell(record),
        },
        {
            title: 'Формат',
            dataIndex: 'formats',
            filters: [
                {
                    text: 'XLSX',
                    value: 'xlsx',
                },
                {
                    text: 'CSV',
                    value: 'csv',
                },
                {
                    text: 'DBF',
                    value: 'dbf',
                },
            ],
            onFilter: (value, record) => record.formats.indexOf(value) === 0,
            render: (text, record) => FileFormats(text),
        },
        {
            title: 'Дата изменения',
            dataIndex: 'updatedAt',
            sorter: (a, b) => a.updatedAt.localeCompare(b.updatedAt),
            ...SearchByColumn('updatedAt'),
        },
        {
            title: 'Дата создания',
            dataIndex: 'createdAt',
            sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
            ...SearchByColumn('createdAt'),
        },
        {
            render: (text, record) => ActionButtons(actionButtonsLinks, record),
        },

    ];

    const handleSave = (updatedData) => {
        setFormData(updatedData);
    };

    const handleReset = () => {
        setUpdatedFormData(formData);
    };

    const handleChange = (e) => {
        const inputValue = e.target.value;
        const inputName = e.target.name;

        setUpdatedFormData((prevFormData) => ({
            ...prevFormData,
            [inputName]: inputValue,
        }));

        if (inputValue !== formData[inputName]) {
            const updatedData = {...updatedFormData, [inputName]: inputValue};
            openConfirmAction({onSave: () => handleSave(updatedData), onReset: handleReset});
        } else {
            closeConfirmAction();
        }
    };



    const config = {
        data: {
            type: 'fetch',
            value: 'https://assets.antv.antgroup.com/g2/stocks.json',
            transform: [{type: 'filter', callback: (d) => d.symbol === 'GOOG'}],
        },
        xField: 'date',
        yField: 'price',
        style: {
            fill: `linear-gradient(-90deg, white 0%, ${color} 100%)`,
        },


        line: {
            style: {
                stroke: color,
            },
        },
    };

    useEffect(() => {
        // Функция, которая закрывает окно подтверждения действия после перехода на другую страницу
        return () => {
            closeConfirmAction()
        };
    }, []);
    return (

        <ProtectedElement allowedPermissions={'develop'}>
            <div>
                <div>
                    <Head>
                        <title>TEST ZONE | {process.env.NEXT_PUBLIC_APP_NAME}</title>
                    </Head>
                    <div>
                        <h1>TEST ZONE</h1>
                        <UniversalSelect
                            name='name1'
                            selectedOptions={['11001', 4447, 4553,]}
                            firstOptionSelected
                            onSelectChange={handleSelectorChange}
                            // fetchDataConfig={fetchDataConfig}
                            options={options}
                            isMulti
                            isSearchable
                            createNewValues
                            // type='number'
                        />
                        <div className='d-flex mt-2 justify-content-between'>
                            <div className='d-flex align-items-center'>
                            <bottom
                                type="primary"
                                className="btn btn-danger"
                                onClick={() => openNotification({
                                    type: "error",
                                    message: 'Произошла неизвестная ошибка'
                                })}
                            >
                                Ошибка
                            </bottom>
                            <bottom
                                type="primary"
                                className="ms-2 btn btn-success"
                                onClick={() => openNotification({
                                    type: "success",
                                    message: 'Операция выполнена успешно'
                                })}
                            >
                                Успех
                            </bottom>
                            <FormInput
                                defaultValue={formData.value1}
                                className='ms-2'
                                name='value1'
                                value={updatedFormData.value1}
                                placeholder="Введите данные"
                                onChange={handleChange}
                            />
                            </div>
                            <div className='d-flex align-items-end'>
                                <DatePicker.RangePicker
                                    className='ms-5'
                                    locale="ru"
                                    // size='large'
                                />
                                <ColorPicker

                                    className='ms-2'
                                    onChangeComplete={(color) => {
                                        setColor(color.toHexString());
                                    }}
                                    showText={(color) => <span>Цвет {color.toHexString()}</span>}
                                    defaultValue="darkblue"/>
                            </div>
                        </div>
                        {/*<ChartArea key={color} config={config}/>*/}
                        <div className='mt-2'>
                            <div className="d-flex justify-content-end w-100">
                                <Link href={REGISTRY_CREATE_URL} className="btn btn-purple">Добавить запись</Link>
                            </div>
                            <SmartTable
                                model='Registry'
                                columns={tableColumns}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedElement>
    );
};
