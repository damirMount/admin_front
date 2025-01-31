import React, {useEffect, useState} from 'react';
import {useAlert} from "../../../contexts/AlertContext";
import {useSession} from "next-auth/react";
import {GET_PAYMENTS_STATISTIC_API} from "../../../routes/api";
import ChartArea from "./ChartArea";

const PaymentsChart = () => {
    const {openNotification} = useAlert();
    const {data: session} = useSession(); // Получаем сессию
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);

    const getPaymentsStatistic = async () => {
        setLoading(true)
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7); // Вычитаем 7 дней

        const endDate = new Date();

        const params = new URLSearchParams({
            startDate: startDate.toISOString().split("T")[0], // Преобразуем в YYYY-MM-DD
            endDate: endDate.toISOString().split("T")[0],
        });
        try {
            const response = await fetch(`${GET_PAYMENTS_STATISTIC_API}?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.accessToken}`, // Проверка токена
                },
            });

            if (response.ok) {
                const responseData = await response.json();
                setData(responseData.data);
            } else {
                const errorResponse = await response.json();
                openNotification({type: "error", message: errorResponse.message});
            }
        } catch (error) {
            openNotification({type: "error", message: "Произошла ошибка при создании отчета"});
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 300);
        }
    };

    useEffect(() => {
        getPaymentsStatistic()

    }, []);


    const config = {
        data: data,
        xField: (d) => new Date(d.date_proc).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: 'short'
        }).replace('/', '-'),
        yField: 'total_pay',
        style: {
            fill: `linear-gradient(-90deg, white 0%, darkblue 100%)`,
        },
        axis: {
            y: {labelFormatter: '~s', locale: 'ru-RU'},
            x: {duration: 45},
        },
        tooltip: {
            name: "<b>Сумма</b>",
            channel: 'y',
            valueFormatter: (d) => new Intl.NumberFormat('en-EN').format(parseFloat(d).toFixed(2)) + ' сом'
        },
        line: {
            tooltip: false,
            style: {
                stroke: 'darkblue',
                strokeWidth: 2,
            },
        },
    };
    // После загрузки компонента отображаем его с переданными пропсами и стилями
    return (
        <ChartArea
            onCallBack={getPaymentsStatistic}
            loading={loading}
            key={data}
            config={config}
        />
    );
};

export default PaymentsChart;
