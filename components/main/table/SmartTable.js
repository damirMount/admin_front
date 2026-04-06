import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Table} from 'antd';
import {useAlert} from '../../../contexts/AlertContext';
import {useSession} from 'next-auth/react';
import {DndContext} from '@dnd-kit/core';
import {restrictToVerticalAxis} from '@dnd-kit/modifiers';
import {arrayMove, SortableContext, verticalListSortingStrategy} from '@dnd-kit/sortable';
import fetchData from '../database/DataFetcher';
import {DraggableBodyRow} from './cell/DraggableBodyRow';
import UniqueKeyGenerator from '../system/UniqueKeyGenerator';

const SmartTable = ({
                        model,
                        columns: baseColumns,
                        paginationPosition = ['rightBottom'],
                        pagination = {
                            pageSizeOptions: ['50', '75', '100'],
                            defaultPageSize: 50,
                            position: paginationPosition,
                        },
                        sortableRows = false,
                        rowClassName,
                        expandableContent,
                        onRow,
                        data = [],
                        onUpdateData,
                        loading = false,
                        bordered = true,
                        className = 'mt-3 w-100',
                        size = 'middle',
                        scroll,
                        ...rest
                    }) => {
    const {openNotification} = useAlert();
    const {data: session} = useSession();

    const [dataTable, setDataTable] = useState([]);
    const [expandedRowKeys, setExpandedRowKeys] = useState([]);

    // Вычисляем колонки: если нужна сортировка, добавляем служебную колонку в начало
    const finalColumns = useMemo(
        () => {
            if (sortableRows) {
                return [
                    {
                        key: 'sort',
                        width: 50,
                        align: 'center',
                    },
                    ...baseColumns
                ];
            }
            return baseColumns;
        },
        [baseColumns, sortableRows]
    );

    const addKeyToData = useCallback(
        (items) => {
            return items?.map(
                (item, index) => {
                    return {
                        ...item,
                        key: item.key || item.id?.toString() || `row-${index}-${UniqueKeyGenerator()}`,
                    };
                }
            ) || [];
        },
        []
    );

    const fetchDataFromDB = useCallback(
        async () => {
            if (!model) {
                return;
            }
            try {
                const config = {
                    model,
                    sort: '{"column":"id","direction":"desc"}'
                };
                const response = await fetchData(config, session);
                setDataTable(addKeyToData(response.data));
            } catch (error) {
                openNotification({
                    type: 'error',
                    message: `Ошибка при получении данных: ${error.message}`,
                });
            }
        },
        [model, session, addKeyToData, openNotification]
    );

    useEffect(
        () => {
            if (model) {
                fetchDataFromDB();
            }
        },
        [fetchDataFromDB, model]
    );

    useEffect(
        () => {
            if (!model) {
                setDataTable(addKeyToData(data));
            }
        },
        [data, model, addKeyToData]
    );

    const handleRowClick = (event, record) => {
        const isClickableElement = event.target.closest('[data-clickable="true"]') ||
            event.target.closest('.ant-dropdown') ||
            event.target.closest('button');

        if (!isClickableElement && expandableContent) {
            const isExpanded = expandedRowKeys.includes(record.key);

            if (isExpanded) {
                setExpandedRowKeys(
                    expandedRowKeys.filter(
                        (key) => {
                            return key !== record.key;
                        }
                    )
                );
            } else {
                setExpandedRowKeys([...expandedRowKeys, record.key]);
            }
        }
    };

    const onDragEnd = ({active, over}) => {
        // Если over не существует (перетащили "в никуда") или ID совпадает с активным
        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = dataTable.findIndex(
            (item) => {
                return item.key === active.id;
            }
        );

        const newIndex = dataTable.findIndex(
            (item) => {
                return item.key === over.id;
            }
        );

        // Проверяем, что оба индекса найдены (не равны -1)
        if (oldIndex !== -1 && newIndex !== -1) {
            const reordered = arrayMove(dataTable, oldIndex, newIndex);
            setDataTable(reordered);

            if (onUpdateData) {
                onUpdateData(reordered);
            }
        }
    };

    return (
        <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
            <SortableContext
                items={dataTable.map((item) => {
                    return item.key;
                })}
                strategy={verticalListSortingStrategy}
            >
                <Table
                    {...rest}
                    className={className}
                    columns={finalColumns}
                    dataSource={dataTable}
                    loading={loading}
                    bordered={bordered}
                    size={size}
                    expandable={
                        expandableContent
                            ? {
                                expandedRowRender: expandableContent,
                                expandedRowKeys: expandedRowKeys,
                                onExpand: (expanded, record) => {
                                    if (expanded) {
                                        setExpandedRowKeys([...expandedRowKeys, record.key]);
                                    } else {
                                        setExpandedRowKeys(
                                            expandedRowKeys.filter(
                                                (key) => {
                                                    return key !== record.key;
                                                }
                                            )
                                        );
                                    }
                                },
                            }
                            : undefined
                    }
                    onRow={
                        (record) => {
                            return {
                                onClick: (event) => {
                                    return handleRowClick(event, record);
                                },
                                style: {
                                    cursor: expandableContent ? 'pointer' : 'default'
                                },
                                ...onRow?.(record)
                            };
                        }
                    }
                    rowClassName={rowClassName}
                    scroll={scroll}
                    pagination={pagination}
                    components={{
                        body: {
                            row: DraggableBodyRow
                        },
                    }}
                />
            </SortableContext>
        </DndContext>
    );
};

export default SmartTable;
