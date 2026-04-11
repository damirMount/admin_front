import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Card, Col, Divider, message, Row, Statistic, Tag, Typography} from 'antd';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChartLine, faWallet} from "@fortawesome/free-solid-svg-icons";
import {faClock} from "@fortawesome/free-regular-svg-icons";
import dayjs from "dayjs";

// API & Components
import {GET_ANTIFRAUD_PROFILE_PAYMENTS_API} from "../../../../../../routes/api";
import ProfileWhitelistCard
    from "../../../../../../components/pages/security/anti-fraud/ProfileWhitelistCard/ProfileWhitelistCard";
import SmartTable from "../../../../../../components/main/table/SmartTable";
import {MoneyFormatNumber} from "../../../../../../components/main/system/MoneyFormatNumber";
import {findById} from "../../../../../../components/main/system/FindById";
import {ANTI_FRAUD_CHECK_STATUS} from "../../../../../../components/pages/security/anti-fraud/constants";

import './ProfileDetails.css';
import HourlyActivityChart from "../../../../../../components/main/charts/HourlyActivityChart";
import WeeklyActivityChart from "../../../../../../components/main/charts/WeeklyActivityChart";
import AmountRangesChart from "../../../../../../components/main/charts/AmountRangesChart";
import TerminalDistributionChart from "../../../../../../components/main/charts/TerminalDistributionChart";
import PaymentTimelineChart from "../../../../../../components/main/charts/PaymentTimelineChart";

const {Text, Title} = Typography;

const ProfileDetails = ({record, session, apparatsList, token}) => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({current: 1, pageSize: 100});

    const totalAmount = useMemo(() => {
        return payments.reduce((sum, p) => sum + Number(p.amount), 0);
    }, [payments]);

    const columns = useMemo(() => [
        {
            title: "№",
            width: 50,
            align: "center",
            render: (_, __, idx) => (pagination.current - 1) * pagination.pageSize + idx + 1
        },
        {
            title: "ID платежа",
            dataIndex: "payment_id",
            width: 110,
            render: (id) => <Text copyable className="fw-medium" style={{color: token.colorPrimary}}>{id}</Text>
        },
        {
            title: "ID аппарата",
            dataIndex: "apparat_id",
            render: (id) => {
                const app = findById(apparatsList, id);
                const label = app.id ? `${app.id} ${app.name}` : `Точка #${id}`;
                return <span className="af-text-sm fw-medium">{label}</span>;
            }
        },
        {
            title: "Сумма",
            dataIndex: "amount",
            className: 'text-end',
            width: 100,
            render: (sum) => (
                <span className="fw-medium">
                    {MoneyFormatNumber(sum, 'full')}
                    <span className='ms-1 text-decoration-underline small'>c</span>
                </span>
            )
        },
        {
            title: "Статус",
            dataIndex: "action",
            width: 150,
            render: (val) => {
                const s = ANTI_FRAUD_CHECK_STATUS[val] || ANTI_FRAUD_CHECK_STATUS.wait;
                return <Tag icon={s.icon} color={s.color} className='fw-bold m-0'>{s.label}</Tag>;
            }
        },
        {
            title: "Дата создания",
            dataIndex: "createdAt",
            width: 150,
            render: (date) => (
                <div className="text-secondary d-flex align-items-center gap-2 small">
                    <FontAwesomeIcon icon={faClock} className="opacity-50"/>
                    <span>{date ? dayjs(date).format("DD.MM.YY HH:mm:ss") : "-"}</span>
                </div>
            )
        },
    ], [pagination, apparatsList, token]);

    const fetchHistory = useCallback(async () => {
        if (payments.length > 0) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${GET_ANTIFRAUD_PROFILE_PAYMENTS_API}/${record.id}`, {
                headers: {'Authorization': `Bearer ${session?.accessToken}`}
            });
            if (response.ok) {
                const res = await response.json();
                const data = Array.isArray(res) ? res[0] : (res.data?.[0] || res.data);
                setPayments(data?.history || []);
            }
        } catch (e) {
            message.error("Ошибка загрузки");
        } finally {
            setLoading(false);
        }
    }, [record.id, session, payments.length]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return (
        <div className="p-3">
            <ProfileWhitelistCard client={record}/>

            <Divider orientation="left" plain className="my-4">
                <Title level={5} className="m-0">Аналитические сводки</Title>
            </Divider>

            <Row gutter={[16, 16]}>
                <Col span={5}>
                    <div className="d-flex flex-column gap-3 h-100">
                        <Card bordered size="small" className="shadow-sm rounded-3">
                            <Statistic
                                title={<Text type="secondary" className="small">Всего транзакций</Text>}
                                value={payments.length}
                                valueStyle={{fontSize: '20px', fontWeight: 600}}
                                prefix={<FontAwesomeIcon icon={faChartLine} className="me-2 fs-6"
                                                         style={{color: token.colorPrimary}}/>}
                            />
                        </Card>
                        <Card bordered size="small" className="shadow-sm rounded-3">
                            <Statistic
                                title={<Text type="secondary" className="small">Общий оборот</Text>}
                                value={MoneyFormatNumber(totalAmount, 'short')}
                                precision={0}
                                suffix={<span className="small ms-1 text-decoration-underline money-prefix">с</span>}
                                valueStyle={{fontSize: '20px', fontWeight: 600}}
                                prefix={<FontAwesomeIcon icon={faWallet} className="me-2 fs-6 text-success"/>}
                            />
                        </Card>
                    </div>
                </Col>
                <Col span={11}>
                    <Card title="Активность (24ч)" size="small">
                        <HourlyActivityChart payments={payments} token={token}/>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="По дням недели" size="small">
                        <WeeklyActivityChart payments={payments} token={token}/>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Анализ сумм">
                        <AmountRangesChart payments={payments} token={token}/>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="По точкам">
                        <TerminalDistributionChart payments={payments} apparatsList={apparatsList} token={token}/>
                    </Card>
                </Col>
                <Col span={24}>
                    <Card title="Динамика">
                        <PaymentTimelineChart payments={payments} token={token}/>
                    </Card>
                </Col>
            </Row>

            <SmartTable
                loading={loading}
                data={payments}
                size="small"
                columns={columns}
                onChange={setPagination}
                pagination={{position: ['rightBottom'], defaultPageSize: 10}}
            />
        </div>
    );
};

export default ProfileDetails;