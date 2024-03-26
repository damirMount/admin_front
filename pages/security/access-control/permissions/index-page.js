import Head from "next/head";
import React from "react";
import {PERMISSION_CREATE_URL, PERMISSION_EDIT_URL} from "../../../../routes/web";
import SmartTable from "../../../../components/main/table/SmartTable";
import SearchByColumn from "../../../../components/main/table/cell/SearchByColumn";
import ActionButtons from "../../../../components/main/table/cell/ActionButtons";
import Link from "next/link";
import {PERMISSION_DELETE_API} from "../../../../routes/api";
import ProtectedElement from "../../../../components/main/system/ProtectedElement";

export default function rolesAndPermissionsPage() {

    const actionButtonsLinks = {
        editRoute: {label: 'Изменить запись', link: PERMISSION_EDIT_URL, useId: true},
        deleteRoute: {label: 'Удалить', link: PERMISSION_DELETE_API, useId: true},
    };

    const tableColumns = [
        // {
        //     key: 'sort',
        //     dataIndex: 'id'
        // },
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
            render: (text) => <b>{(text)}</b>,
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
            ...SearchByColumn('description'),

        },
        {
            render: (text, record) => ActionButtons(actionButtonsLinks, record),
        },

    ];

    return (
        <ProtectedElement allowedPermissions={'access_management'}>
            <div>
                <Head>
                    <title>Лист разрешений | {process.env.NEXT_PUBLIC_APP_NAME}</title>
                </Head>
                <div>
                    <h1>Лист разрешений</h1>
                    <div className='mt-2'>
                        <div className="d-flex justify-content-end w-100">
                            <Link href={PERMISSION_CREATE_URL} className="btn btn-purple">Добавить запись</Link>
                        </div>
                        <SmartTable
                            model='Permission'
                            columns={tableColumns}
                        />
                    </div>
                </div>
            </div>
        </ProtectedElement>
    )
}
