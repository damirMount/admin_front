import React, { useCallback, useEffect, useState } from 'react';
import { Table } from 'antd';
import { useAlert } from '../../../contexts/AlertContext';
import { useSession } from 'next-auth/react';
import { DndContext } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import fetchData from '../database/DataFetcher';
import { DraggableBodyRow } from './cell/DraggableBodyRow';
import UniqueKeyGenerator from '../system/UniqueKeyGenerator';

const SmartTable = ({
                        model,
                        columns,
                        paginationPosition = ['rightBottom'],
                        pagination = {
                            pageSizeOptions: ['50', '75', '100'],
                            defaultPageSize: 50,
                            position: paginationPosition,
                        },
                        rowClassName,
                        expandableContent, // Функция (record) => ReactNode
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
    const { openNotification } = useAlert();
    const { data: session } = useSession();

    const [dataTable, setDataTable] = useState([]);
    const [expandedRowKeys, setExpandedRowKeys] = useState([]);

    // Генерация ключей, если их нет
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

    // Эффект для загрузки данных по модели (автономный режим)
    useEffect(
        () => {
            if (model) {
                fetchDataFromDB();
            }
        },
        [fetchDataFromDB, model]
    );

    // Эффект для синхронизации с внешними данными (проп data)
    // ИСПРАВЛЕНО: Убрано условие data.length > 0, чтобы пустой массив тоже прокидывался в стейт
    useEffect(
        () => {
            if (!model) {
                setDataTable(addKeyToData(data));
            }
        },
        [data, model, addKeyToData]
    );

    // Логика раскрытия строки
    const handleRowClick = (event, record) => {
        const isClickableElement = event.target.closest('[data-clickable="true"]') ||
            event.target.closest('.ant-dropdown') ||
            event.target.closest('button');

        if (!isClickableElement && expandableContent) {
            const isExpanded = expandedRowKeys.includes(record.key);

            if (isExpanded) {
                // Если строка уже открыта — убираем её ключ из массива (закрываем)
                setExpandedRowKeys(
                    expandedRowKeys.filter(
                        (key) => {
                            return key !== record.key;
                        }
                    )
                );
            } else {
                // Если закрыта — добавляем ключ к существующим
                setExpandedRowKeys([...expandedRowKeys, record.key]);
            }
        }
    };

    const onDragEnd = ({ active, over }) => {
        if (active.id !== over?.id) {
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
            const reordered = arrayMove(dataTable, oldIndex, newIndex);
            setDataTable(reordered);
            onUpdateData?.(reordered);
        }
    };

    return (
        <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
            <SortableContext items={dataTable.map((item) => { return item.key; })} strategy={verticalListSortingStrategy}>
                <Table
                    {...rest}
                    className={className}
                    columns={columns}
                    dataSource={dataTable}
                    loading={loading}
                    bordered={bordered}
                    size={size}
                    // Если передан контент, включаем expandable
                    expandable={
                        expandableContent
                            ? {
                                expandedRowRender: expandableContent,
                                expandedRowKeys: expandedRowKeys,
                                // Синхронизируем состояние при клике на стандартную иконку "+"
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
                                    // Если есть контент для раскрытия, ставим pointer
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
