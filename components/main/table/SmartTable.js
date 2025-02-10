import React, {useEffect, useState} from 'react';
import {Table} from 'antd';
import {useAlert} from '../../../contexts/AlertContext';
import {useSession} from 'next-auth/react';
import {DndContext} from '@dnd-kit/core';
import {restrictToVerticalAxis} from '@dnd-kit/modifiers';
import {arrayMove, SortableContext, verticalListSortingStrategy,} from '@dnd-kit/sortable';
import fetchData from "../database/DataFetcher";
import {DraggableBodyRow} from "./cell/DraggableBodyRow";
import UniqueKeyGenerator from "../system/UniqueKeyGenerator";

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
                        size = 'middle'
                    }) => {
    const {openNotification} = useAlert();
    const {data: session} = useSession(); // Получаем сессию
    const [dataTable, setDataTable] = useState([]);

    const addKeyToData = (data) => {
        if (!data) return []; // Проверяем, определен ли data
        return data.map((item) => ({
            ...item,
            key: item.key || UniqueKeyGenerator(), // Генерируем уникальный ключ, если его нет
        }));
    };

    useEffect(() => {
        if (!model) {
            try {
                const hasKeyForAllItems = data.every(item => item.key);
                if (hasKeyForAllItems) {
                    setDataTable(data)
                } else {
                    const newData = addKeyToData(data);
                    setDataTable(newData);
                    onUpdateData && onUpdateData(newData);
                }
            } catch (error) {
                console.log(error);
            }
        }
    }, [data]);

    useEffect(() => {
        if (model) {
            fetchDataFromDB();
        }
    }, []);

    const fetchDataFromDB = async () => {
        try {
            const fetchDBConfig = {
                model: model,
                sort: '{"column":"id","direction":"desc"}',
            };

            const response = await fetchData(fetchDBConfig, session);
            const updatedData = response.data.map((item, index) => ({...item, key: `${index}`}));
            setDataTable(updatedData);
        } catch (error) {
            openNotification({
                type: 'error', message: 'Ошибка при получении данных: ' + error.message,
            });
        }
    };

    const onDragEnd = ({active, over}) => {
        if (active.id !== over?.id) {
            const activeIndex = dataTable.findIndex((i) => i.key === active.id);
            const overIndex = dataTable.findIndex((i) => i.key === over?.id);
            const newDataTable = arrayMove(dataTable, activeIndex, overIndex);
            setDataTable(newDataTable);
            onUpdateData && onUpdateData(newDataTable);
        }
    };

    return (
        <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
            <SortableContext
                items={dataTable ? dataTable.map((item) => item.key) : []}
                strategy={verticalListSortingStrategy}
            >
                <Table
                    className={className}
                    pagination={{
                        pageSizeOptions: ['50', '75', '100'],
                        defaultPageSize: 50,
                        position: paginationPosition,
                        size: 'large'
                    }}
                    expandable={expandable}
                    onRow={onRow}
                    rowClassName={rowClassName}
                    bordered={bordered}
                    loading={loading}
                    size={size}
                    columns={columns}
                    dataSource={dataTable}
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
