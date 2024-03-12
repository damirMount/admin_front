import Head from "next/head";
import React from "react";
import {REGISTRY_EDIT_URL} from "../../../routes/web";
import {REGISTRY_DELETE_API} from "../../../routes/api";
import SmartTable from "../../../components/main/table/SmartTable";
import SearchByColumn from "../../../components/main/table/cell/SearchByColumn";
import ActionButtons from "../../../components/main/table/cell/ActionButtons";

export default function usersListPage() {
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
            title: 'Дилер',
            dataIndex: 'id_region',
            className: 'col-10',
            sorter: (a, b) => a.id_region - b.id_region,
            ...SearchByColumn('id_region'),
        },
        {
            title: 'Логин',
            dataIndex: 'login',
            sorter: (a, b) => a.login.localeCompare(b.login),
            ...SearchByColumn('login'),
        },
        {
            title: 'ФИО',
            dataIndex: 'fio',
            sorter: (a, b) => String(a.fio).localeCompare(String(b.fio)),
            ...SearchByColumn('fio'),
        },
        {
            title: 'Роль',
            dataIndex: 'id_role',
            sorter: (a, b) => a.id_role - b.id_role,
            ...SearchByColumn('id_role'),
        },
        {
            render: (text, record) => ActionButtons(actionButtonsLinks, record),
        },

    ];

    return (
        <div>
            <Head>
                <title>Список пользователей | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div>
                <h1>Список пользователей</h1>
                <SmartTable
                    model='User'
                    columns={tableColumns}
                />
            </div>
        </div>
    )
};
