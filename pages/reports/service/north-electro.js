import React, {useEffect, useState} from "react";
import {GET_REPORTS_NORTHELECTRO_REPORT_API} from "../../../routes/api";
import Head from "next/head";
import DateRangePicker from "../../../components/main/input/DateRangePicker";
import UniversalSelect from "../../../components/main/input/UniversalSelect";
import {useSession} from "next-auth/react";
import {useAlert} from "../../../contexts/AlertContext";
import ProtectedElement from "../../../components/main/system/ProtectedElement";
import SmartTable from "../../../components/main/table/SmartTable";
import {Divider, Statistic} from "antd";


export default function DealerExportPage() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [dataTable, setDataTable] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [paymentCount, setPaymentCount] = useState(0);

    const {openNotification} = useAlert();
    const [formData, setFormData] = useState({
        serviceType: 'offline',
        clientType: 'physical',
        paymentType: 'ordinary',
        startDate: null,
        endDate: null,
    });
    const {data: session} = useSession(); // Получаем сессию

    const tableColumns = [
        {
            title: 'Список районов',
            dataIndex: 'label',
            render: (text, record) => record && record.label === 'ИТОГО:' ? <b>{text}</b> : text
        },
        {
            title: 'Кол-во платежей',
            dataIndex: 'paymentCount',
            sorter: (a, b) => a.paymentCount - b.paymentCount,
            render: (text, record) => {
                const formattedPaymentCount = parseFloat(text).toFixed(2); // Округление до 2 знаков после запятой
                const formattedWithCommas = new Intl.NumberFormat('en-EN').format(formattedPaymentCount)

                if (record && record.label === 'ИТОГО:') {
                    return <b>{formattedWithCommas} шт.</b>;
                }
                return formattedWithCommas;
            }
        },
        {
            title: 'Сумма',
            dataIndex: 'totalAmount',
            sorter: (a, b) => a.totalAmount - b.totalAmount,
            render: (text, record) => {
                const formattedTotalAmount = parseFloat(text).toFixed(2); // Округление до 2 знаков после запятой
                const formattedWithCommas = new Intl.NumberFormat('en-EN').format(formattedTotalAmount)

                if (record && record.label === 'ИТОГО:') {
                    return <b>{formattedWithCommas} сом</b>;
                }
                return formattedWithCommas;
            }
        }
    ];

    const handleCreateReport = async () => {
        try {
            setLoading(true);

            const dataToSend = {
                formData,
            };
            const response = await fetch(GET_REPORTS_NORTHELECTRO_REPORT_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.accessToken}`, // Проверка токена
                },
                body: JSON.stringify(dataToSend),
            });

            if (response.ok) {
                const responseData = await response.json();

                const totalResult = responseData.find(item => item.label === 'ИТОГО:');

                setTotalAmount(totalResult ? totalResult.totalAmount : 0);
                setPaymentCount(totalResult ? totalResult.paymentCount : 0);

                setDataTable(responseData);

                openNotification({type: "success", message: "Отчет успешно создан."});
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


    const handleSelectorChange = (valuesArray, name) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: valuesArray,
        }));
    }

    useEffect(() => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            startDate: startDate,
            endDate: endDate,
        }));
    }, [startDate, endDate]);


    return (
        <ProtectedElement allowedPermissions={'reports_management'}>
            <div>
                <Head>
                    <title>Итоговый отчет по Северэлектро | {process.env.NEXT_PUBLIC_APP_NAME}</title>
                </Head>
                <div className="w-100 mt-5">
                    <h1>Итоговый отчет по Северэлектро</h1>

                    <div className='d-flex justify-content-between'>
                        <SmartTable
                            size='small'
                            loading={loading}
                            paginationPosition={['none']}
                            columns={tableColumns}
                            data={dataTable}
                        />
                        <div className='border-end ms-3 mt-3 me-2'></div>
                        <div className='d-flex w-75 ms-4 flex-column'>
                            <div className='d-flex justify-content-between'>
                                <div className="form-group w-50 me-2">
                                    <label htmlFor="selected_report_type">Тип сервиса</label>
                                    <UniversalSelect
                                        isSearchable={false}
                                        firstOptionSelected
                                        options={[
                                            {value: 'offline', label: 'Оффлайн сервис'},
                                            {value: 'online', label: 'Онлайн сервис'},
                                        ]}
                                        onSelectChange={handleSelectorChange}
                                        required
                                        name="serviceType"
                                    />
                                </div>
                                <div className="form-group w-50">
                                    <label htmlFor="selected_report_type">Тип клиентов</label>

                                    <UniversalSelect
                                        isSearchable={false}
                                        selectedOptions={'physical'}
                                        options={[
                                            {value: 'physical', label: 'Физ. лица'},
                                            {value: 'legal', label: 'Юр. лица'},
                                        ]}
                                        isDisabled={formData.serviceType === 'online'}
                                        onSelectChange={handleSelectorChange}
                                        required
                                        name="clientType"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="selected_report_type">Тип платежей</label>
                                <UniversalSelect
                                    isSearchable={false}
                                    selectedOptions={'ordinary'}
                                    options={[
                                        {value: 'all', label: 'Все платежи'},
                                        {value: 'ordinary', label: 'Обычные платежи'},
                                        {value: 'penalty', label: 'Оплата пени'},
                                    ]}
                                    isDisabled={formData.serviceType === 'online'}
                                    onSelectChange={handleSelectorChange}
                                    required
                                    name="paymentType"
                                />
                            </div>
                            <DateRangePicker
                                onDateChange={(dates) => {
                                    setStartDate(dates[0]);
                                    setEndDate(dates[1]);
                                }}
                            />
                            <Divider/>
                            <div className='d-flex justify-content-between'>
                                <Statistic title="Итоговая сумма" value={totalAmount} precision={2} suffix={'сом'}
                                           loading={loading}/>
                                <Statistic title="Количество платежей" value={paymentCount} suffix={'шт.'}
                                           loading={loading}/>
                            </div>
                            <Divider/>
                            <div className="d-flex justify-content-center">
                                <button type="button" className="btn btn-purple" disabled={loading}
                                        onClick={handleCreateReport}>
                                    Получить отчёт
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </ProtectedElement>
    );
};
