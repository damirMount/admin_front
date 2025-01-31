import {Statistic} from "antd";
import React, {useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faHandHoldingDollar, faLandmark} from "@fortawesome/free-solid-svg-icons";
import {GET_DEALER_BALANCE_API, GET_DEALER_CREDIT_API} from "../../../routes/api";
import {useAlert} from "../../../contexts/AlertContext";
import {useSession} from "next-auth/react";

const DealerBalance = () => {
    const {openNotification} = useAlert();
    const {data: session} = useSession(); // Получаем сессию
    const [loading, setLoading] = useState(true);
    const [dealerBalance, setDealerBalance] = useState(0);
    const [dealerCredit, setDealerCredit] = useState(0);

    const getDealerBalance = async () => {
        try {
            const response = await fetch(GET_DEALER_BALANCE_API, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.accessToken}`, // Проверка токена
                },
            });

            if (response.ok) {
                const responseData = await response.json();
                setDealerBalance(responseData.balance ?? 0);
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

    const getDealerCredit = async () => {
        try {
            const response = await fetch(GET_DEALER_CREDIT_API, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.accessToken}`, // Проверка токена
                },
            });

            if (response.ok) {
                const responseData = await response.json();
                setDealerCredit(responseData.credit ?? 0);

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
        getDealerBalance()
        getDealerCredit()
    }, []);

    return (
        <div className="card">
            <div className="card-body">
                <Statistic
                    title="Баланс"
                    prefix={
                        <FontAwesomeIcon icon={faHandHoldingDollar} className='color-purple me-2'/>
                    }
                    valueStyle={dealerBalance < 0 ? {color: '#cf1322'} : {}}
                    loading={loading}
                    value={dealerBalance}
                    precision={2}
                    suffix={'сом'}
                />
                <Statistic
                    title="Кредит"
                    prefix={
                        <FontAwesomeIcon icon={faLandmark} className='color-purple me-2'/>
                    }
                    valueStyle={dealerCredit < 0 ? {color: '#cf1322'} : {}}
                    loading={loading}
                    value={dealerCredit}
                    precision={2}
                    suffix={'сом'}
                />
            </div>
        </div>
    );
};

export default DealerBalance;
