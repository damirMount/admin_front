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

            sorter: (a, b) => a.name.localeCompare(b.name),
            ...SearchByColumn('name'),
        },
        {
            title: 'Заголовок',
            dataIndex: 'title',
            sorter: (a, b) => a.title.localeCompare(b.title),
            ...SearchByColumn('title'),
        },
        {
            title: 'Описание',
            dataIndex: 'description',
            className: 'col-10',
            sorter: (a, b) => a.description.localeCompare(b.description),
            ...SearchByColumn('description'),
        },
        {
            render: (text, record) => ActionButtons(actionButtonsLinks, record),
        },

    ];

    return (
        <div>
            <Head>
                <title>Список прав | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div>
                <h1>Список прав</h1>
                <SmartTable
                    model='Permission'
                    columns={tableColumns}
                />
            </div>
        </div>
    )
}
