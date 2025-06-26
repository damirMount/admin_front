import React, { useEffect, useState, useCallback } from 'react';
import { Table } from 'antd';
import { useAlert } from '../../../contexts/AlertContext';
import { useSession } from 'next-auth/react';
import { DndContext } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import fetchData from '../database/DataFetcher';
import { DraggableBodyRow } from './cell/DraggableBodyRow';
import UniqueKeyGenerator from '../system/UniqueKeyGenerator';

const SmartTable = ({
                        model,
                        columns,
                        paginationPosition = ['leftBottom'],
                        rowClassName,
                        expandable,
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

    const addKeyToData = useCallback((items) => {
        return items?.map(item => ({
            ...item,
            key: item.key || UniqueKeyGenerator(),
        })) || [];
    }, []);

    const fetchDataFromDB = useCallback(async () => {
        if (!model) return;
        try {
            const config = {
                model,
                sort: '{"column":"id","direction":"desc"}',
            };
            const response = await fetchData(config, session);
            const withKeys = response.data.map((item, index) => ({
                ...item,
                key: `${index}`,
            }));
            setDataTable(withKeys);
        } catch (error) {
            openNotification({
                type: 'error',
                message: `Ошибка при получении данных: ${error.message}`,
            });
        }
    }, [model, session]);

    useEffect(() => {
        if (model) {
            fetchDataFromDB();
        }
    }, [fetchDataFromDB]);

    useEffect(() => {
        if (!model && data.length > 0) {
            const hasKeys = data.every(item => item?.key);
            const preparedData = hasKeys ? data : addKeyToData(data);
            setDataTable(preparedData);
            if (!hasKeys && onUpdateData) {
                onUpdateData(preparedData);
            }
        }
    }, [data, model, addKeyToData, onUpdateData]);

    const onDragEnd = ({ active, over }) => {
        if (active.id !== over?.id) {
            const oldIndex = dataTable.findIndex(item => item.key === active.id);
            const newIndex = dataTable.findIndex(item => item.key === over.id);
            const reordered = arrayMove(dataTable, oldIndex, newIndex);
            setDataTable(reordered);
            onUpdateData?.(reordered);
        }
    };

    return (
        <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
            <SortableContext
                items={dataTable.map(item => item.key)}
                strategy={verticalListSortingStrategy}
            >
                <Table
                    {...rest}
                    className={className}
                    columns={columns}
                    dataSource={dataTable}
                    loading={loading}
                    bordered={bordered}
                    size={size}
                    expandable={expandable}
                    onRow={onRow}
                    rowClassName={rowClassName}
                    scroll={scroll}
                    pagination={{
                        pageSizeOptions: ['50', '75', '100'],
                        defaultPageSize: 50,
                        position: paginationPosition,
                        size: 'large',
                    }}
                    components={{
                        body: {
                            row: DraggableBodyRow,
                        },
                    }}
                />
            </SortableContext>
        </DndContext>
    );
};

export default SmartTable;
