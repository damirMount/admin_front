import React, {useEffect, useMemo, useState} from "react";
import Head from "next/head";
import {Badge, Card, Space, Tag, theme, Typography} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faShieldHalved} from "@fortawesome/free-solid-svg-icons";
import {faClock} from "@fortawesome/free-regular-svg-icons";
import {useSession} from "next-auth/react";
import dayjs from "dayjs";
import {useRouter} from "next/router";

import SmartTable from "../../../../components/main/table/SmartTable";
import ProtectedElement from "../../../../components/main/system/ProtectedElement";
import {useAlert} from "../../../../contexts/AlertContext";
import PaymentRulesDetails from "./components/PaymentRulesDetails/PaymentRulesDetails";
import {MoneyFormatNumber} from "../../../../components/main/system/MoneyFormatNumber";

import useAntiFraudData, {getDefaults} from "./hooks/useAntiFraudData";
import FilterForm from "./components/FilterForm";
import {getPaymentStatusInfo} from "../../../../components/main/payments/PaymentsConstants";

const {Text, Title} = Typography;

export default function AntiFraudHistoryPage() {
    const {token} = theme.useToken();
    const {openNotification} = useAlert();
    const {data: session} = useSession();
    const router = useRouter();

    const {historyData, loading, dictionaries, getHistory} = useAntiFraudData(session, openNotification);
    const [pagination, setPagination] = useState(
        {
            current: 1,
            pageSize: 100
        }
    );

    useEffect(
        () => {
            if (session?.accessToken && router.isReady) {
                const hasQueryParams = Object.keys(router.query).length > 0;

                if (!hasQueryParams && historyData.length === 0 && !loading) {
                    getHistory(getDefaults());
                }
            }
        },
        [session, getHistory, router.isReady]
    );

    const columns = useMemo(
        () => {
            return [
                {
                    title: "№",
                    width: 50,
                    align: "center",
                    render: (_, __, index) => {
                        return (pagination.current - 1) * pagination.pageSize + index + 1;
                    }
                },
                {
                    title: "ID Платежа",
                    dataIndex: "id",
                    width: "150px",
                    render: (id, payment) => {
                        const statusInfo = getPaymentStatusInfo(payment.payments_run, payment.additional1);

                        return (
                            <Space direction="vertical" size={0}>
                                <Text copyable strong style={{color: token.colorPrimary}}>
                                    {id}
                                </Text>
                                <Space size={4}>
                                    <Badge
                                        color={statusInfo.color}

                                    />
                                    <Text type="secondary" style={{fontSize: "11px"}}>
                                        {statusInfo.text}
                                    </Text>
                                </Space>
                            </Space>
                        );
                    }
                },
                {
                    title: "Реквизит",
                    dataIndex: "identifier",
                    render: (val, payment) => {
                        const service = dictionaries.services.find(
                            (s) => {
                                return s.id === payment.id_service;
                            }
                        );
                        const serviceName = service?.name || `Сервис #${payment.id_service}`;
                        return (
                            <Space direction="vertical" size={0}>
                                <Text strong copyable>
                                    {val}
                                </Text>
                                <Text type="secondary" style={{fontSize: "11px"}}>
                                    ({payment.id_service}) {serviceName}
                                </Text>
                            </Space>
                        );
                    }
                },
                {
                    title: "Сумма",
                    dataIndex: "real_pay",
                    width: "160px",
                    render: (val, payment) => {
                        return (
                            <div className="d-flex flex-column">
                                <Text strong style={{fontSize: "15px"}}>
                                    {MoneyFormatNumber(val, "full")} сом
                                </Text>
                                {payment.total !== payment.real_pay && (
                                    <Text type="secondary" style={{fontSize: "11px"}}>
                                        Внесено {MoneyFormatNumber(payment.total, "full")} сом
                                    </Text>
                                )}
                            </div>
                        );
                    }
                },
                {
                    title: "Риск",
                    dataIndex: "additional2",
                    width: "110px",
                    align: "center",
                    render: (val) => {
                        const score = Number(val || 0);
                        const color = score >= 80 ? "#ff4d4f" : score >= 30 ? "#faad14" : "#52c41a";
                        return (
                            <Tag color={color} style={{borderRadius: "10px", fontWeight: "bold", border: "none"}}>
                                {score} Баллов
                            </Tag>
                        );
                    }
                },
                {
                    title: "Дата",
                    dataIndex: "time",
                    width: "160px",
                    render: (date) => {
                        return (
                            <Space className="text-secondary">
                                <FontAwesomeIcon icon={faClock} style={{opacity: 0.7}}/>
                                <Text type="secondary">
                                    {date ? dayjs(date).format("DD.MM.YY HH:mm:ss") : "-"}
                                </Text>
                            </Space>
                        );
                    }
                }
            ];
        },
        [pagination, dictionaries.services, token.colorPrimary]
    );

    return (
        <ProtectedElement allowedPermissions={"access_management"}>
            <Head>
                <title>Аудит Антифрод</title>
            </Head>
            <div className="container-fluid py-4">
                <div
                    className="d-flex justify-content-between align-items-center mb-4 p-4 shadow-sm border-primary"
                    style={{
                        borderRadius: "1rem",
                        borderLeft: "5px solid #4c3a75",
                        backgroundColor: "#fff"
                    }}
                >
                    <div className="d-flex align-items-center">
                        <div className="bg-primary text-white me-3 shadow-sm" style={{
                            padding: "1rem",
                            borderRadius: "0.75rem"
                        }}>
                            <FontAwesomeIcon icon={faShieldHalved} size="2x"/>
                        </div>
                        <div>
                            <Title level={3} className="m-0">
                                Мониторинг безопасности Антифрод
                            </Title>
                            <Text type="secondary">
                                Анализ транзакций и подозрительной активности
                            </Text>
                        </div>
                    </div>
                </div>

                <FilterForm onSearch={getHistory} loading={loading} dictionaries={dictionaries}/>

                <Card
                    className="shadow-sm border-0 rounded-4 overflow-hidden"
                    bodyStyle={{padding: 0}}
                    title={
                        <Space>
                            <div style={{width: 4, height: 20, backgroundColor: token.colorPrimary, borderRadius: 2}}/>
                            <Text strong style={{fontSize: "16px"}}>
                                Журнал транзакций
                            </Text>
                        </Space>
                    }
                >
                    <SmartTable
                        loading={loading}
                        data={historyData}
                        size={"small"}
                        columns={columns}
                        onChange={setPagination}
                        expandableContent={
                            (record) => {
                                return (
                                    <PaymentRulesDetails
                                        record={record}
                                        session={session}
                                        servicesList={dictionaries.services}
                                        dealersList={dictionaries.dealers}
                                        apparatsList={dictionaries.apparats}
                                        serversList={dictionaries.servers}
                                    />
                                );
                            }
                        }
                        pagination={
                            {
                                position: ['rightTop', 'rightBottom'],
                                defaultPageSize: 100,
                                showSizeChanger: true,
                            }
                        }
                    />
                </Card>
            </div>
        </ProtectedElement>
    );
}
