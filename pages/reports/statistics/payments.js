import Head from "next/head";
import React, { useMemo, useState } from "react";
import ProtectedElement from "../../../components/main/system/ProtectedElement";
import PaymentsFilterForm from "./components/PaymentsFilterForm";
import PaymentsStatisticsTable from "./components/PaymentsStatisticsTable"; // Подключаем наш новый компонент
import { Card, Col, Divider, Row, Space, Statistic, Typography } from "antd";
import PaymentTimelineChart from "../../../components/main/charts/PaymentTimelineChart";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins, faWallet } from "@fortawesome/free-solid-svg-icons";
import MoneyColumn from "../../../components/main/system/MoneyColumn";
import { useAlert } from "../../../contexts/AlertContext";
import { useSession } from "next-auth/react";
import usePaymentsStatisticActions from "./hooks/usePaymentsStatisticActions";

const { Title, Text } = Typography;

export default function PaymentsStatisticsPage({ dictionaries }) {
    const { openNotification } = useAlert();
    const { data: session } = useSession();

    const [loading, setLoading] = useState(false);
    const [statistics, setStatistics] = useState([]);

    const { getPaymentsStatistics } = usePaymentsStatisticActions(session, openNotification);

    const handleSearch = async (formValues) => {
        setLoading(true);
        const resultData = await getPaymentsStatistics(formValues);
        setStatistics(resultData || []);
        setLoading(false);
    };

    // Глобальные итоги для верхних виджетов и подвала таблицы
    const totalSummary = useMemo(() => {
        return statistics.reduce((acc, curr) => {
            const isSuccess = String(curr.payments_status || "").toLowerCase() === "success";

            // 1. Общий итог (все подряд)
            acc.all.count += Number(curr.count || 0);
            acc.all.total += Number(curr.total || 0);
            acc.all.real_pay += Number(curr.real_pay || 0);
            acc.all.real_pay_rur += Number(curr.real_pay_rur || 0);
            acc.all.commission += Number(curr.commission || 0);

            // 2. Разделение по группам (успех / ошибка)
            const target = isSuccess ? acc.success : acc.fail;
            target.count += Number(curr.count || 0);
            target.total += Number(curr.total || 0);
            target.real_pay += Number(curr.real_pay || 0);
            target.real_pay_rur += Number(curr.real_pay_rur || 0);
            target.commission += Number(curr.commission || 0);

            return acc;
        }, {
            all: { count: 0, total: 0, real_pay: 0, real_pay_rur: 0, commission: 0 },
            success: { count: 0, total: 0, real_pay: 0, real_pay_rur: 0, commission: 0 },
            fail: { count: 0, total: 0, real_pay: 0, real_pay_rur: 0, commission: 0 }
        });
    }, [statistics]);

    return (
        <ProtectedElement allowedPermissions={"reports_management"}>
            <div>
                <Head>
                    <title>Статистика платежей | {process.env.NEXT_PUBLIC_APP_NAME}</title>
                </Head>

                <PaymentsFilterForm onSearch={handleSearch} loading={loading} dictionaries={dictionaries} />

                <div>
                    <Title level={3}>Статистика платежей</Title>
                    <Row gutter={[12, 12]}>
                        <Col span={12}>
                            <Card className="shadow-sm h-100 d-flex align-items-center">
                                <Space size={24}>
                                    <Statistic title="Проведено (Сумма)" value={totalSummary.all.real_pay} precision={2} suffix={"KGS"} />
                                    <Divider type="vertical" style={{ height: "50px" }} />
                                    <Statistic title="Количество платежей" value={totalSummary.all.count} suffix={"ед."} />
                                </Space>
                            </Card>
                        </Col>

                        <Col span={12}>
                            <div className="p-3 rounded-3 h-100 bg-light border">
                                <Text type="secondary" className="label-medium">
                                    <Space><FontAwesomeIcon icon={faWallet}/> Финансовые итоги выборки</Space>
                                </Text>
                                <div className="d-flex justify-content-between align-items-center pt-4">
                                    <MoneyColumn label="Внесено" value={totalSummary.all.total} />
                                    <Divider type="vertical" className="finance-divider"/>
                                    <MoneyColumn label="Проведено" value={totalSummary.all.real_pay} color="#52c41a"/>
                                    <Divider type="vertical" className="finance-divider"/>
                                    <MoneyColumn label="Комиссия" value={totalSummary.all.commission}/>
                                    <Divider type="vertical" className="finance-divider"/>
                                    <MoneyColumn label="В рублях (RUR)" value={totalSummary.all.real_pay_rur} prefix={<FontAwesomeIcon icon={faCoins}/>}/>
                                </div>
                            </div>
                        </Col>

                        <Col span={24} className="mt-2">
                            <Card title="Динамика платежей" className="shadow-sm" size="small">
                                <PaymentTimelineChart payments={statistics} token={[]}/>
                            </Card>
                        </Col>
                    </Row>
                </div>

                <Row gutter={[16, 16]} className="mt-4">
                    <Col span={24}>
                        <Card title="Детализированные данные куба отчета" size="small" className="shadow-sm">
                            {/* Вынесенный компонент таблицы */}
                            <PaymentsStatisticsTable
                                statistics={statistics}
                                loading={loading}
                                totalSummary={totalSummary}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
        </ProtectedElement>
    );
}