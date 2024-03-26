// pages/index.js
import React from 'react';
import Head from 'next/head';
import {REGISTRY_DELETE_API} from "../../../routes/api";
import StatusIndicator from "../../../components/main/table/cell/StatusIndicator";
import RegistryNavigationTabs from "../../../components/pages/registry/RegistryNavigationTabs";
import {REGISTRY_CREATE_URL, REGISTRY_EDIT_URL} from "../../../routes/web";
import Link from "next/link";
import SearchByColumn from "../../../components/main/table/cell/SearchByColumn";
import ServerCell from "../../../components/main/table/cell/ServerCell";
import FileFormats from "../../../components/main/table/cell/FileFormats";
import ActionButtons from "../../../components/main/table/cell/ActionButtons";
import SmartTable from "../../../components/main/table/SmartTable";
import ProtectedElement from "../../../components/main/system/ProtectedElement";

export default function RegistryPage() {


    const actionButtonsLinks = {
        editRoute: {label: 'Изменить запись', link: REGISTRY_EDIT_URL, useId: true},
        deleteRoute: {label: 'Удалить', link: REGISTRY_DELETE_API, useId: true},
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
        <ProtectedElement allowedPermissions={'registry_management'}>
            <div>
                <Head>
                    <title>Список реестров | {process.env.NEXT_PUBLIC_APP_NAME}</title>
                </Head>
                <div>
                    <h1>Список реестров</h1>

                    <div className="create-button d-flex justify-content-center">
                        <RegistryNavigationTabs/>
                    </div>

                    <div className='mt-5'>
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
        </ProtectedElement>
    );
};
