import React, { useEffect, useState } from 'react';
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
import fetchData from "../database/DataFetcher";
import {DraggableBodyRow} from "./cell/DraggableBodyRow"; // Импорт CSS из @dnd-kit/utilities
const SmartTable = ({
                        model,
                        columns,
                        paginationPosition = ['leftBottom'],
                        rowClassName,
                        onRow,
                        data,
                    }) => {
    const { openNotification } = useAlert();
    const { data: session } = useSession(); // Получаем сессию
    const [dataTable, setDataTable] = useState(data);

    useEffect(() => {
        if (model) {
            fetchDataFromDB();
        }
    }, []);
    useEffect(() => {
        setDataTable(data)
    }, [data]);

    const fetchDataFromDB = async () => {
        try {
            const fetchDBConfig = {
                model: model,
                sort: '{"column":"id","direction":"desc"}',
            };

            const response = await fetchData(fetchDBConfig, session);
            const updatedData = response.data.map((item, index) => ({ ...item, key: `${index}` }));
            setDataTable(updatedData);
        } catch (error) {
            openNotification({
                type: 'error', message: 'Ошибка при получении данных: ' + error.message,
            });
        }
    };

    const onDragEnd = ({ active, over }) => {

        if (active.id !== over?.id) {
            const activeIndex = dataTable.findIndex((i) => i.key === active.id);
            const overIndex = dataTable.findIndex((i) => i.key === over?.id);
            const newDataTable = arrayMove(dataTable, activeIndex, overIndex);
            console.log(dataTable,newDataTable,overIndex,activeIndex)
            setDataTable(newDataTable);
        }
    };



    return (
        <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
            <SortableContext
                items={dataTable ? dataTable.map((item) => item.key) : []}
                strategy={verticalListSortingStrategy}
            >
                <Table
                    className="mt-3"
                    pagination={{
                        pageSizeOptions: ['50', '75', '100'],
                        defaultPageSize: 50,
                        position: paginationPosition,
                    }}
                    onRow={onRow}
                    rowClassName={rowClassName}
                    bordered={true}
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
