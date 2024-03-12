// pages/index.js
import React, {useState} from 'react';
import Head from 'next/head';
import {REGISTRY_DELETE_API} from "../routes/api";
import StatusIndicator from "../components/main/table/cell/StatusIndicator";
import UniversalSelect from "../components/main/input/UniversalSelect";
import Link from "next/link";
import {useSession} from "next-auth/react";
import {REGISTRY_CREATE_URL, REGISTRY_EDIT_URL} from "../routes/web";
import {DatePicker} from "antd";
import ActionButtons from "../components/main/table/cell/ActionButtons";
import FileFormats from "../components/main/table/cell/FileFormats";
import ServerCell from "../components/main/table/cell/ServerCell";
import SearchByColumn from "../components/main/table/cell/SearchByColumn";
import SmartTable from "../components/main/table/SmartTable";

export default function TestPage() {
    const {data: session} = useSession(); // Получаем сессию
    const [formData, setFormData] = useState({
        name: '',
        formats: [],
        is_blocked: '',
    });

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
            render: (text, record) => ServerCell(record),
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


    return (
        // <ProtectedRoute allowedRoles={3}>
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
                        fetchDataConfig={fetchDataConfig}
                        options={options}
                        isMulti
                        isSearchable
                        createNewValues
                        // type='number'
                    />
                    <DatePicker.RangePicker
                        size="large"
                        locale="ru"
                    />
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
        // </ProtectedRoute>
    );
};

// export default TestPage;
