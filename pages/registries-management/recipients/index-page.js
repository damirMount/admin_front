// pages/index.js
import React from 'react';
import Head from 'next/head';
import {RECIPIENT_DELETE_API} from "../../../routes/api";
import StatusIndicator from "../../../components/main/table/cell/StatusIndicator";
import RegistryNavigationTabs from "../../../components/pages/registry/RegistryNavigationTabs";
import {RECIPIENT_CREATE_URL, RECIPIENT_EDIT_URL} from "../../../routes/web";
import Link from "next/link";
import SmartTable from "../../../components/main/table/SmartTable";
import SearchByColumn from "../../../components/main/table/cell/SearchByColumn";
import ActionButtons from "../../../components/main/table/cell/ActionButtons";
import TypeSend from "../../../components/main/table/cell/TypeSend";

export default function RecipientPage() {

    const actionButtonsLinks = {
        editRoute: {label: 'Изменить запись', link: RECIPIENT_EDIT_URL, useId: true},
        deleteRoute: {label: 'Удалить', link: RECIPIENT_DELETE_API, useId: true},
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
            title: 'Тип отправки',
            dataIndex: 'type',
            className: 'col-2',
            filters: [
                {
                    text: 'Каждый день',
                    value: 1,
                },
                {
                    text: 'Раз в неделю',
                    value: 2,
                },
                {
                    text: 'Раз в месяц',
                    value: 3,
                },
                {
                    text: 'Каждый год',
                    value: 4,
                },
            ],
            onFilter: (value, record) => record.type === value,
            render: (text, record) => TypeSend(record),
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
        <div>
            <Head>
                <title>Список получателей | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div>
                <h1>Список получателей</h1>

                <div className="create-button d-flex justify-content-center">
                    <RegistryNavigationTabs/>
                </div>

                <div className='mt-5'>
                    <div className="d-flex justify-content-end w-100">
                        <Link href={RECIPIENT_CREATE_URL} className="btn btn-purple">Добавить запись</Link>
                    </div>
                    <SmartTable
                        model='Recipient'
                        columns={tableColumns}
                    />
                </div>

            </div>

        </div>
    );
};
