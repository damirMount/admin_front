import React, {useEffect, useState} from 'react';
import {Table} from "antd";
import fetchData from "../database/DataFetcher";
import {useAlert} from "../../../contexts/AlertContext";
import {useSession} from "next-auth/react";


const SmartTable = ({model, columns, data}) => {
    const {openNotification} = useAlert();
    const {data: session} = useSession(); // Получаем сессию
    const [dataTable, setDataTable] = useState([])

    const fetchDataFromDB = async () => {
        try {
            const fetchDBConfig = {
                model: model,
                sort: '{"column":"id","direction":"desc"}',
            };

            const response = await fetchData(fetchDBConfig, session);

            setDataTable(response.data)
        } catch (error) {
            openNotification({
                type: 'error', message: 'Ошибка при получении данных: ' + error.message,
            });
        }
    }

    useEffect(() => {
        if (model) {
            fetchDataFromDB()
        }
    }, []);

    useEffect(() => {
        setDataTable(data)
    }, [data]);

    return (
        <Table
            className="mt-3"
            pagination={{
                pageSizeOptions: ['50', '75', '100'],
                defaultPageSize: 50,

            }}
            bordered="Bordered"
            columns={columns}
            dataSource={dataTable}
        />
    );
};

export default SmartTable;
