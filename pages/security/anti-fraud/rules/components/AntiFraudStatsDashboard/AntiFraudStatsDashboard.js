import React, {useCallback, useEffect, useState} from 'react';
import {Card, Col, DatePicker, Progress, Row, Spin, Statistic, Table, Tag, Tooltip, Typography} from 'antd';
import {
    CheckCircleTwoTone,
    InfoCircleOutlined,
    SafetyCertificateTwoTone,
    ThunderboltTwoTone,
    WarningTwoTone
} from '@ant-design/icons';
import {GET_ANTIFRAUD_STATISTIC_API} from "../../../../../../routes/api";

const {RangePicker} = DatePicker;
const {Title, Text} = Typography;

const AntiFraudStatsDashboard = ({session}) => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);

    /**
     * Универсальное форматирование времени
     * @param minutes {string|number} - время в минутах
     * @param isDetection {boolean} - если true, отдаем приоритет секундам
     */
    const formatTime = (minutes, isDetection = false) => {
        const totalMinutes = parseFloat(minutes);
        if (isNaN(totalMinutes) || totalMinutes === 0) return "0 сек";

        const totalSeconds = Math.round(totalMinutes * 60);

        // Для MTTD (Детекция) - если меньше минуты, показываем секунды
        if (isDetection && totalMinutes < 1) {
            return `${totalSeconds} сек`;
        }

        // Если меньше часа - показываем минуты и секунды
        if (totalMinutes < 60) {
            const sec = Math.round((totalMinutes % 1) * 60);
            return `${Math.floor(totalMinutes)}м ${sec > 0 ? sec + 'с' : ''}`;
        }

        // Если меньше суток - часы и минуты
        if (totalMinutes < 1440) {
            const h = Math.floor(totalMinutes / 60);
            const m = Math.round(totalMinutes % 60);
            return `${h}ч ${m}м`;
        }

        // Если больше суток - дни и часы
        const d = Math.floor(totalMinutes / 1440);
        const h = Math.round((totalMinutes % 1440) / 60);
        return `${d}д ${h}ч`;
    };

    const fetchStats = useCallback(async (dates = []) => {
        setLoading(true);
        try {
            const [startDate, endDate] = dates;
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await fetch(`${GET_ANTIFRAUD_STATISTIC_API}?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.accessToken}`,
                }
            });

            const result = await response.json();
            if (result.success) setStats(result.data);
        } catch (error) {
            console.error("Fetch error", error);
        } finally {
            setLoading(false);
        }
    }, [session]);

    useEffect(() => {
        if (session?.accessToken && !stats) {
            fetchStats();
        }
    }, [session, fetchStats]);

    if (loading || !stats) return (
        <Card className="mt-4 shadow-sm text-center py-5 border-0 rounded-3">
            <Spin size="large" tip="Загрузка аналитики антифрода..."/>
        </Card>
    );

    const quality = stats.registryQuality || {};

    return (
        <div className="mt-4 mb-4 container-fluid px-0">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white rounded-3 shadow-sm border">
                <div className="m-0">
                    <Title level={3} className="m-0 mb-1">📊 Эффективность Антифрода</Title>
                    <Text className="text-muted">Всего транзакций за период: <b>{stats.totalTransactions?.toLocaleString()}</b></Text>
                </div>
                <RangePicker onChange={(d, s) => fetchStats(s)} className="rounded-2" placeholder={['Начало', 'Конец']}/>
            </div>

            {/* KPI Cards */}
            <Row gutter={[16, 16]}>
                <Col span={6}>
                    <Card size='small' className="shadow-sm">
                        <Statistic
                            title={<Text strong style={{fontSize: '11px'}}>ПОДТВЕРЖДЕННЫЙ ФРОД <Tooltip title="Точность (Precision)"><InfoCircleOutlined/></Tooltip></Text>}
                            value={stats.confirmedBlockedRate}
                            valueStyle={{color: '#52c41a'}}
                            prefix={<SafetyCertificateTwoTone twoToneColor="#52c41a"/>}
                        />
                        <Text type="secondary" style={{fontSize: '11px'}}>Точность правил</Text>
                    </Card>
                </Col>

                <Col span={6}>
                    <Card size='small' className="shadow-sm">
                        <Statistic
                            title={<Text strong style={{fontSize: '11px'}}>ПОЛНОТА (RECALL) <Tooltip title="Доля выявленных мошеннических операций"><InfoCircleOutlined/></Tooltip></Text>}
                            value={stats.recallRate}
                            valueStyle={{color: '#1890ff'}}
                            prefix={<CheckCircleTwoTone twoToneColor="#1890ff"/>}
                        />
                        <Text type="secondary" style={{fontSize: '11px'}}>Выявление инцидентов</Text>
                    </Card>
                </Col>

                <Col span={6}>
                    <Card size='small' className="shadow-sm">
                        <Statistic
                            title={<Text strong style={{fontSize: '11px'}}>ЛОЖНЫЕ (FPR) <Tooltip title="Ошибочные блокировки"><InfoCircleOutlined/></Tooltip></Text>}
                            value={stats.falsePositiveRate}
                            valueStyle={{color: stats.falsePositiveRate === '0.00%' ? '#52c41a' : '#faad14'}}
                            prefix={<WarningTwoTone twoToneColor="#faad14"/>}
                        />
                        <Text type="secondary" style={{fontSize: '11px'}}>Ложные срабатывания</Text>
                    </Card>
                </Col>

                <Col span={6}>
                    <Card size='small' className="shadow-sm bg-light">
                        <Statistic
                            title={<Text strong style={{fontSize: '11px'}} className="text-primary">В ОЧЕРЕДИ (WAIT)</Text>}
                            value={stats.unprocessedAlerts}
                            valueStyle={{color: stats.unprocessedAlerts > 0 ? '#ff4d4f' : '#52c41a'}}
                            prefix={<ThunderboltTwoTone twoToneColor={stats.unprocessedAlerts > 0 ? '#ff4d4f' : '#52c41a'}/>}
                        />
                        <Text type="secondary" style={{fontSize: '11px'}}>Ожидают решения</Text>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} className="mt-3">
                <Col span={14}>
                    <Card
                        title={<Text strong>Топ методов мошенничества ({stats.documentedMethodsCount})</Text>}
                        size='small'
                        className="shadow-sm border-0 h-100"
                    >
                        <Table
                            dataSource={stats.topMethods || []}
                            pagination={false}
                            size="small"
                            rowKey="name"
                            columns={[
                                {
                                    title: 'Метод',
                                    dataIndex: 'name',
                                    key: 'name',
                                    render: t => <Text code>{t}</Text>
                                },
                                {
                                    title: 'Срабатываний',
                                    dataIndex: 'count',
                                    key: 'count',
                                    align: 'right',
                                    render: v => <Tag color="blue" className="m-0">{v.toLocaleString()}</Tag>
                                }
                            ]}
                        />
                    </Card>
                </Col>

                <Col span={10}>
                    <Card title="Операционные показатели" size='small' className="shadow-sm border-0 h-100">
                        <Row gutter={[16, 16]} className="mb-4">
                            <Col span={12}>
                                <Statistic
                                    title={<Tooltip title="Mean time to detect (Время автоматического обнаружения)">Детекция (MTTD) <InfoCircleOutlined/></Tooltip>}
                                    // Используем флаг isDetection для показа в секундах
                                    value={formatTime(stats.mttdMin, true)}
                                    valueStyle={{fontSize: '18px', fontWeight: 'bold'}}
                                />
                            </Col>
                            <Col span={12}>
                                <Statistic
                                    title={<Tooltip title="Mean time to respond (Время реакции человека)">Реакция (MTTR) <InfoCircleOutlined/></Tooltip>}
                                    value={formatTime(stats.mttrMin)}
                                    valueStyle={{fontSize: '18px', fontWeight: 'bold'}}
                                />
                            </Col>
                        </Row>

                        <div className="mb-3">
                            <div className="d-flex justify-content-between mb-1">
                                <Text type="secondary" style={{fontSize: '12px'}}>Качество реестра (Актуальность)</Text>
                                <Text strong>{quality.actualization || 0}%</Text>
                            </div>
                            <Progress percent={quality.actualization} size="small" status="success" strokeWidth={6} showInfo={false}/>
                        </div>

                        <div className="mb-3">
                            <div className="d-flex justify-content-between mb-1">
                                <Text type="secondary" style={{fontSize: '12px'}}>Полнота Snapshot (Логирование)</Text>
                                <Text strong>{quality.fullness || 0}%</Text>
                            </div>
                            <Progress percent={quality.fullness} size="small" strokeWidth={6} showInfo={false}/>
                        </div>

                        <div className="p-2 bg-light rounded-2 border border-dashed">
                            <Text type="secondary" style={{fontSize: '12px'}}>Клиентский опыт:</Text>
                            <div className="mt-1 d-flex align-items-center">
                                <Tag color="green" className="m-0">Разрешение споров: {stats.customerResolutionRate}</Tag>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AntiFraudStatsDashboard;
