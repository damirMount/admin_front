import React, {useMemo, useState} from "react";
import Head from "next/head";
import {Badge, Card, Space, Tag, theme, Typography} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDisplay, faShieldHalved, faUser} from "@fortawesome/free-solid-svg-icons";
import {faClock} from "@fortawesome/free-regular-svg-icons";
import {useSession} from "next-auth/react";
import dayjs from "dayjs";

import SmartTable from "../../../../components/main/table/SmartTable";
import ProtectedElement from "../../../../components/main/system/ProtectedElement";
import {useAlert} from "../../../../contexts/AlertContext";
import PaymentRulesDetails from "./components/PaymentRulesDetails/PaymentRulesDetails";

import useAntiFraudData from "./hooks/useAntiFraudData";
import FilterForm from "./components/FilterForm";

const {Text, Title} = Typography;

export default function AntiFraudHistoryPage() {
    const {token} = theme.useToken();
    const {openNotification} = useAlert();
    const {data: session} = useSession();

    const {historyData, loading, dictionaries, getHistory} = useAntiFraudData(session, openNotification);
    const [pagination, setPagination] = useState(
        {
            current: 1,
            pageSize: 100
        }
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
                    dataIndex: "id_payment",
                    width: "150px",
                    render: (id, payment) => {
                        return (
                            <Space direction="vertical" size={0}>
                                <Text copyable strong style={{color: token.colorPrimary}}>
                                    {id}
                                </Text>
                                <Space size={4}>
                                    <Badge
                                        color="#722ed1"
                                    />
                                    <Text type="secondary" style={{fontSize: "11px"}}>
                                        Кол-во проверок {payment.iteration}
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
                                return Number(s.id) === Number(payment.id_service);
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
                    title: "Статус",
                    dataIndex: "final_action",
                    width: "200px",
                    render: (val, payment) => {
                        const score = Number(payment.total_score || 0);
                        let statusScore;
                        if (score >= 79) {
                            statusScore = {
                                color: 'red',
                                label:  `${score} AF - ВЫСОКИЙ РИСК`
                            }
                        } else if (score >= 29 ){
                            statusScore = {
                                color: 'gold',
                                label:  `${score} AF - СРЕДНИЙ РИСК`
                            }
                        } else {
                            statusScore = {
                                color: 'green',
                                label:  `${score} AF - НИЗКИЙ РИСК`
                            }
                        }

                        const statusMap = {
                            allow: {
                                color: 'green-inverse',
                                label: 'Разрешён системой', icon: <FontAwesomeIcon icon={faDisplay} className="me-2"/>,
                            },
                            deny: {
                                color: 'red-inverse',
                                label: 'Отклонён системой', icon: <FontAwesomeIcon icon={faDisplay} className="me-2"/>
                            },
                            wait: {
                                color: '#838585',
                                label: 'В ожидании проверки', icon: <FontAwesomeIcon icon={faClock} className="me-2"/>
                            },
                            approve: {
                                color: 'blue-inverse',
                                label: 'Разрешён оператором', icon: <FontAwesomeIcon icon={faUser} className="me-2"/>
                            },
                            reject: {
                                color: 'volcano-inverse',
                                label: 'Отклонён оператором', icon: <FontAwesomeIcon icon={faUser} className="me-2"/>
                            }
                        };


                        const style = statusMap[val] || statusMap.wait;

                        return (
                            <div
                                className="d-flex flex-column"
                                style={{gap: '5px'}}
                            >
                                <Tag
                                    icon={style.icon}
                                    className='fw-bold m-0 text-center'
                                    color={style.color}
                                >
                                    {style.label}
                                </Tag>

                                <div className="d-flex align-items-center">
                                    <Badge
                                        color={statusScore.color}
                                        className='me-2'
                                    />
                                    <Text
                                        type="secondary"
                                        className='fw-medium'
                                        style={{
                                            fontSize: '13px',
                                        }}
                                    >
                                        {statusScore.label}
                                    </Text>
                                </div>
                            </div>
                        );
                    }
                },
                {
                    title: "Дата",
                    dataIndex: "createdAt",
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
