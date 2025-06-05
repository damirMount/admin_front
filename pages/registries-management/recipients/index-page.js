import React, {useEffect, useState} from 'react';
import Head from 'next/head';
import {GET_REGISTRY_BY_RECIPIENT_API, RECIPIENT_DELETE_API} from "../../../routes/api";
import StatusIndicator from "../../../components/main/table/cell/StatusIndicator";
import RegistryNavigationTabs from "../../../components/pages/registry/RegistryNavigationTabs";
import {RECIPIENT_CREATE_URL, RECIPIENT_EDIT_URL, REGISTRY_EDIT_URL} from "../../../routes/web";
import Link from 'next/link';
import SmartTable from "../../../components/main/table/SmartTable";
import SearchByColumn from "../../../components/main/table/cell/SearchByColumn";
import ActionButtons from "../../../components/main/table/cell/ActionButtons";
import TypeSend from "../../../components/main/table/cell/TypeSend";
import ProtectedElement from "../../../components/main/system/ProtectedElement";
import {Divider, Table, Tooltip} from "antd";
import {useSession} from "next-auth/react";
import {useAlert} from "../../../contexts/AlertContext";
import ServerAndServiceCountCell from "../../../components/main/table/cell/ServerAndServiceCountCell";
import FileFormats from "../../../components/main/table/cell/FileFormats";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUpRightFromSquare} from "@fortawesome/free-solid-svg-icons";

export default function RecipientPage() {
    const {data: session} = useSession(); // Получаем сессию
    const actionButtonsLinks = {
        editRoute: {label: 'Изменить запись', link: RECIPIENT_EDIT_URL, useId: true},
        deleteRoute: {label: 'Удалить', link: RECIPIENT_DELETE_API, useId: true},
    };
    const {openNotification} = useAlert();
    const [expandedRowKeys, setExpandedRowKeys] = useState([]);
    const [loadedRegistries, setLoadedRegistries] = useState({});
    const [openDropdownId, setOpenDropdownId] = useState(null);

    const handleExpand = (expanded, record) => {
        const key = record.key;
        setExpandedRowKeys(expanded
            ? [...expandedRowKeys, key]
            : expandedRowKeys.filter(k => k !== key));
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
            render: (text) => {
                if (!text) {
                    return <StatusIndicator text="ON" color="purple"/>
                } else {
                    return <StatusIndicator text="OFF" color="gray"/>
                }
            },
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
            render: (text, record) => {
                const handleDropdownOpen = (open) => {
                    setOpenDropdownId(open ? record.id : null);
                };

                return <ActionButtons
                    {...record}
                    buttonsLinks={actionButtonsLinks}
                    dropdownOpen={openDropdownId === record.id}
                    setDropdownOpen={handleDropdownOpen}
                />
            }
        },
    ];

    const ExpandedRow = ({record}) => {
        const [loading, setLoading] = useState(!loadedRegistries[record.key]);
        const [registries, setRegistries] = useState(loadedRegistries[record.key]?.data || []);

        const columns = [
            {
                title: 'ID',
                dataIndex: 'id',
            },
            {
                title: 'Название',
                dataIndex: 'name',
                className: 'col-7',
            },
            {
                title: 'Статус',
                dataIndex: 'is_blocked',
                render: (text) => StatusIndicator(text),
            },
            {
                title: 'Сервер',
                dataIndex: 'server_id',
                className: 'col-2',
                render: (text, record) => ServerAndServiceCountCell(record),
            },
            {
                title: 'Формат',
                dataIndex: 'formats',
                render: (text) => FileFormats(text, 'small'),
            },
            {
                title: 'Дата изменения',
                dataIndex: 'updatedAt',
            },
            {
                render: (text, record) => (
                    <Tooltip title='Открыть реестр' placement='topRight'>
                        <Link
                            className='btn btn-light color-purple border clickable-element'
                            href={`${REGISTRY_EDIT_URL}/${record.id}`}>
                            <FontAwesomeIcon icon={faUpRightFromSquare}/>
                        </Link>
                    </Tooltip>
                )
            },
        ];

        const getRegistryByRecipient = async () => {
            try {
                const params = new URLSearchParams({
                    id: record.id
                });
                const response = await fetch(`${GET_REGISTRY_BY_RECIPIENT_API}?${params.toString()}`,
                    {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${session.accessToken}`,
                        },
                    });
                const responseData = await response.json();

                if (response.ok) {
                    setRegistries(responseData);
                    setLoadedRegistries(prev => ({
                        ...prev,
                        [record.key]: {
                            data: responseData,
                            loaded: true
                        }
                    }));
                } else {
                    openNotification({type: "error", message: responseData.message});
                }
            } catch (error) {
                openNotification({type: "error", message: error.message});
            }
            setLoading(false);
        };

        useEffect(() => {
            // Проверка на то, были ли ранее загружены вложенные списки или нет
            if (loading && (!loadedRegistries[record.key] || !loadedRegistries[record.key].loaded)) {
                getRegistryByRecipient();
            } else {
                setLoading(false);
            }
        }, [loading, record.key]);

        return (
            <>
                <Divider className='text-secondary text-nowrap'>Список отправляемых реестров</Divider>
                <Table loading={loading} columns={columns} dataSource={registries} pagination={false}/>
            </>
        );
    };

    const expandedRowRender = (record) => {
        return <ExpandedRow record={record}/>;
    };

    const handleRowClick = (event, record) => {
        const isClickableElement = event.target.closest('[data-clickable="true"]');
        if (!isClickableElement) {
            handleExpand(!expandedRowKeys.includes(record.key), record);
        }
    };

    return (
        <ProtectedElement allowedPermissions={'registry_management'}>
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
                            expandable={{
                                expandedRowRender,
                                expandedRowKeys,
                                onExpand: handleExpand
                            }}
                            model='Recipient'
                            columns={tableColumns}
                            onRow={(record) => ({
                                onClick: (event) => handleRowClick(event, record),
                            })}
                        />
                    </div>
                </div>
            </div>
        </ProtectedElement>
    );
}
