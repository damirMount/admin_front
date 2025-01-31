import {Statistic} from "antd";
import React, {useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faMoneyBillTrendUp, faSackDollar} from "@fortawesome/free-solid-svg-icons";
import {GET_PAYMENTS_STATISTIC_API} from "../../../routes/api";
import {useAlert} from "../../../contexts/AlertContext";
import {useSession} from "next-auth/react";

const PaymentsToday = () => {
    const {openNotification} = useAlert();
    const {data: session} = useSession(); // Получаем сессию
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);

    const getPaymentsStatistic = async () => {
        try {
            const response = await fetch(GET_PAYMENTS_STATISTIC_API, {
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
            setLoading(false);
        }
    };

    useEffect(() => {
        getPaymentsStatistic()

    }, []);

    return (
        <div className="card mt-4">
            <div className="card-body">
                <Statistic
                    prefix={
                        <FontAwesomeIcon icon={faMoneyBillTrendUp} className='color-purple me-2'/>
                    }
                    title="Сегодня принято платежей"
                    value={data.length > 0 ? data[data.length - 1].total_count : 0}
                    suffix={'шт.'}
                    loading={loading}
                />
                <Statistic
                    prefix={
                        <FontAwesomeIcon icon={faSackDollar} className='color-purple me-2'/>
                    }
                    title="Проведено"
                    value={data.length > 0 ? data[data.length - 1].total_pay : 0}
                    precision={2}
                    suffix={'сом'}
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default PaymentsToday;
