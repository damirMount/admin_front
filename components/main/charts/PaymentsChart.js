import React, {useEffect, useState} from 'react';
import {useAlert} from '../../../contexts/AlertContext';
import {useSession} from 'next-auth/react';
import {GET_PAYMENTS_STATISTIC_API} from '../../../routes/api';
import {Skeleton, Typography} from 'antd';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSquare} from '@fortawesome/free-solid-svg-icons';
import {Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,} from 'recharts';
import {MoneyFormatNumber} from "../system/MoneyFormatNumber";
import moment from 'moment-timezone';
import PaymentsToday from '../statistic/PaymentsToday';
import DealerBalance from '../statistic/DealerBalance';
import DateRangePicker from "../input/DateRangePicker";

const {Text} = Typography;

// Функция форматирования даты для оси X
const formatDateTick = (d) => new Date(d).toLocaleDateString('ru-RU', {
    day: '2-digit', month: 'short',
}).replace('/', '-');

// Tooltip для суммы платежей
const TotalPayTooltip = ({active, payload}) => {
    if (active && payload && payload.length) {
        const {
            date_proc, success_total_pay, success_real_pay, error_total_pay, processing_total_pay, total_pay
        } = payload[0].payload;
        const formattedDate = new Date(date_proc).toLocaleDateString('ru-RU');

        return (
            <div className="card card-body">
                <Text type="secondary">{`Сумма платежей за ${formattedDate}`}</Text>
                <div className="d-flex align-items-center mt-2">
                    <FontAwesomeIcon icon={faSquare} className="me-2 text-success"/>
                    <div className="d-flex justify-content-between w-100">
                        <Text>Успешные:</Text>
                        <Text className="fw-medium">{MoneyFormatNumber(success_total_pay, 'short')}</Text>
                    </div>
                </div>
                <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faSquare} className="me-2 text-danger"/>
                    <div className="d-flex justify-content-between w-100">
                        <Text>Ошибочные:</Text>
                        <Text className="fw-medium">{MoneyFormatNumber(error_total_pay, 'short')}</Text>
                    </div>
                </div>
                <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faSquare} className="me-2 text-warning"/>
                    <div className="d-flex justify-content-between w-100">
                        <Text>В обработке:</Text>
                        <Text className="fw-medium">{MoneyFormatNumber(processing_total_pay, 'short')}</Text>
                    </div>
                </div>
                <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faSquare} className="me-2 text-primary"/>
                    <div className="d-flex justify-content-between w-100">
                        <Text>Итого:</Text>
                        <Text className="fw-medium">{MoneyFormatNumber(total_pay, 'short')}</Text>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

// Tooltip для количества платежей
const TotalCountTooltip = ({active, payload}) => {
    if (active && payload && payload.length) {
        const {
            date_proc, success_total_count, error_total_count, processing_total_count, total_count
        } = payload[0].payload;
        const formattedDate = new Date(date_proc).toLocaleDateString('ru-RU');

        return (
            <div className="card card-body">
                <Text type="secondary">{`Кол-во платежей за ${formattedDate}`}</Text>
                <div className="d-flex align-items-center mt-2">
                    <FontAwesomeIcon icon={faSquare} className="me-2 text-success"/>
                    <div className="d-flex justify-content-between w-100">
                        <Text>Успешные:</Text>
                        <Text className="fw-medium">{MoneyFormatNumber(success_total_count, 'short')}</Text>
                    </div>
                </div>
                <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faSquare} className="me-2 text-danger"/>
                    <div className="d-flex justify-content-between w-100">
                        <Text>Ошибочные:</Text>
                        <Text className="fw-medium">{MoneyFormatNumber(error_total_count, 'short')}</Text>
                    </div>
                </div>
                <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faSquare} className="me-2 text-warning"/>
                    <div className="d-flex justify-content-between w-100">
                        <Text>В обработке:</Text>
                        <Text className="fw-medium">{MoneyFormatNumber(processing_total_count, 'short')}</Text>
                    </div>
                </div>
                <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={faSquare} className="me-2 text-primary"/>
                    <div className="d-flex justify-content-between w-100">
                        <Text>Итого:</Text>
                        <Text className="fw-medium">{MoneyFormatNumber(total_count, 'short')}</Text>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

const PaymentsChart = () => {
    const {openNotification} = useAlert();
    const {data: session} = useSession();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const {Text} = Typography;
    const [startDate, setStartDate] = useState(moment().subtract(31, 'days').format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));
    // Получение статистики платежей
    const getPaymentsStatistic = async () => {
        setLoading(true);
        const params = new URLSearchParams({startDate, endDate});

        try {
            const response = await fetch(`${GET_PAYMENTS_STATISTIC_API}?${params.toString()}`, {
                method: 'GET', headers: {
                    'Content-Type': 'application/json', Authorization: `Bearer ${session?.accessToken}`,
                },
            });

            if (response.ok) {
                const responseData = await response.json();
                setData(responseData.data);
            } else {
                const errorResponse = await response.json();
                openNotification({type: 'error', message: errorResponse.message});
            }
        } catch (error) {
            openNotification({type: 'error', message: 'Произошла ошибка при создании отчета'});
        } finally {
            setTimeout(() => setLoading(false), 300);
        }
    };

    useEffect(() => {
        getPaymentsStatistic();
    }, []);

    useEffect(() => {
        getPaymentsStatistic();
    }, [startDate, endDate]);

    return (<div className="d-flex justify-content-between">
        <div className="w-75 d-flex flex-column">
            <div className="card card-body">
                <div className="d-flex flex-row w-100 align-items-center justify-content-between">
                    <div className="d-flex flex-column">
                        <Text className="fs-5">Динамика платежей</Text>
                        <Text type='secondary'> {`
                                C ${startDate ? new Date(startDate).toLocaleDateString('ru-RU') : ''}
                                по ${endDate ? new Date(endDate).toLocaleDateString('ru-RU') : ''}
                            `}
                        </Text>
                    </div>
                </div>
                {loading ? (
                    <Skeleton.Node className="w-100 mt-1 h-100 " style={{fontSize: 0}} active/>
                ) : (
                    <>
                        <ResponsiveContainer width="100%" height={420}>
                            <AreaChart
                                syncId="paymentsChart"
                                data={data}
                                margin={{top: 20, right: 40, bottom: 40}}
                            >
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis
                                    dataKey="date_proc"
                                    tickFormatter={formatDateTick}
                                    tick={{angle: 45, textAnchor: 'start', fontSize: 12}}
                                    interval={data.length > 50 ? 'preserveStartEnd' : 0}
                                />
                                <YAxis tickFormatter={(value) => MoneyFormatNumber(value, 'short')}/>
                                <Tooltip content={TotalPayTooltip}/>
                                <Area type="monotone" dataKey="success_total_pay" stackId="1" stroke="green"
                                      fill="green"
                                      name="Успешные"/>
                                <Area type="monotone" dataKey="error_total_pay" stackId="1" stroke="red" fill="red"
                                      name="Ошибочные"/>
                                <Area type="monotone" dataKey="processing_total_pay" stackId="1" stroke="orange"
                                      fill="orange" name="В обработке"/>
                                <Area type="monotone" dataKey="total_pay" stroke="darkBlue" fill="none" name="Итого"/>
                            </AreaChart>
                        </ResponsiveContainer>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart
                                syncId="paymentsChart"
                                data={data}
                                margin={{top: 20, right: 40, bottom: 40}}
                            >
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis
                                    dataKey="date_proc"
                                    tickFormatter={formatDateTick}
                                    tick={{angle: 45, textAnchor: 'start', fontSize: 12}}
                                    interval={data.length > 50 ? 'preserveStartEnd' : 0}
                                />
                                <YAxis tickFormatter={(value) => MoneyFormatNumber(value, 'short')}/>
                                <Tooltip content={TotalCountTooltip}/>
                                <Area type="monotone" dataKey="success_total_count" stackId="1" stroke="green"
                                      fill="green"
                                      name="Успешные"/>
                                <Area type="monotone" dataKey="error_total_count" stackId="1" stroke="red" fill="red"
                                      name="Ошибочные"/>
                                <Area type="monotone" dataKey="processing_total_count" stackId="1" stroke="orange"
                                      fill="orange" name="В обработке"/>
                                <Area type="monotone" dataKey="total_count" stroke="darkBlue" fill="none" name="Итого"/>
                            </AreaChart>

                        </ResponsiveContainer>
                    </>
                )}
            </div>

        </div>
        <div className="w-25 ms-3 text-nowrap">
            <div className='card card-body mb-2'>
                <DateRangePicker
                    allowClear={false}
                    startDate={startDate}
                    endDate={endDate}
                    onDateChange={(dates) => {
                        setStartDate(dates[0]);
                        setEndDate(dates[1]);
                    }}
                />
            </div>
            <DealerBalance/>
            <PaymentsToday/>
        </div>
    </div>)
        ;
};

export default PaymentsChart;
