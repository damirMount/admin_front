import Head from "next/head";
import React from "react";
import {REGISTRY_EDIT_URL} from "../../../../routes/web";
import {REGISTRY_DELETE_API} from "../../../../routes/api";
import SmartTable from "../../../../components/main/table/SmartTable";
import SearchByColumn from "../../../../components/main/table/cell/SearchByColumn";
import ActionButtons from "../../../../components/main/table/cell/ActionButtons";

export default function rolesAndPermissionsPage() {

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
            title: 'Название',
            dataIndex: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            ...SearchByColumn('name'),
        },
        {
            render: (text, record) => ActionButtons(actionButtonsLinks, record),
        },

    ];

    return (
        <div>
            <Head>
                <title>Список ролей | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div>
                <h1>Список ролей</h1>
                <SmartTable
                    model='Role'
                    columns={tableColumns}
                />
            </div>
        </div>
    )
}
