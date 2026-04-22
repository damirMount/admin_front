import React, {useCallback, useEffect, useState} from 'react';
import {Card, Col, DatePicker, Progress, Row, Statistic, Table, Tag, Tooltip, Typography} from 'antd';
import {
    CheckCircleTwoTone,
    InfoCircleOutlined,
    SafetyCertificateTwoTone,
    ThunderboltTwoTone,
    WarningTwoTone
} from '@ant-design/icons';
import dayjs from 'dayjs'; // Импортируем dayjs для работы с датами
import quarterOfYear from 'dayjs/plugin/quarterOfYear'; // Плагин для кварталов
import {GET_ANTIFRAUD_STATISTIC_API} from "../../../../../../routes/api";
import {MoneyFormatNumber} from "../../../../../../components/main/system/MoneyFormatNumber";
import Preloader from "../../../../../../components/main/system/Preloader";

dayjs.extend(quarterOfYear);

const {Title, Text} = Typography;

const AntiFraudStatsDashboard = ({session}) => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);

    // Универсальное форматирование времени
    const formatTime = (minutes, isDetection = false) => {
        const totalMinutes = parseFloat(minutes);
        if (isNaN(totalMinutes) || totalMinutes === 0) return "0 сек";
        const totalSeconds = Math.round(totalMinutes * 60);
        if (isDetection && totalMinutes < 1) return `${totalSeconds} сек`;
        if (totalMinutes < 60) {
            const sec = Math.round((totalMinutes % 1) * 60);
            return `${Math.floor(totalMinutes)}м ${sec > 0 ? sec + 'с' : ''}`;
        }
        if (totalMinutes < 1440) {
            return `${Math.floor(totalMinutes / 60)}ч ${Math.round(totalMinutes % 60)}м`;
        }
        return `${Math.floor(totalMinutes / 1440)}д ${Math.round((totalMinutes % 1440) / 60)}ч`;
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

    // Обработка выбора квартала
    const handleQuarterChange = (date) => {
        if (date) {
            // Формат YYYY-MM-DD — самый безопасный для передачи на бэк
            const start = date.startOf('quarter').format('YYYY-MM-DD');
            const end = date.endOf('quarter').format('YYYY-MM-DD');
            fetchStats([start, end]);
        }
    };

    // Загрузка текущего квартала при старте
    useEffect(() => {
        if (session?.accessToken && !stats) {
            const now = dayjs();
            handleQuarterChange(now);
        }
    }, [session, stats]);

    // Запрет выбора будущих дат
    const disabledDate = (current) => {
        return current && current > dayjs().endOf('day');
    };


    const quality = stats.registryQuality || {};

    return (
        <div className="mt-4 mb-4 container-fluid px-0">
            {/* Header */}
            <div
                className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white rounded-3 shadow-sm border">
                <div className="m-0">
                    <Title level={3} className="m-0 mb-1">📊 Эффективность Антифрода</Title>
                    <Text className="text-muted">Всего транзакций за
                        период: <b>{loading ? 'Загрузка...' : stats.totalTransactions?.toLocaleString()}</b></Text>
                </div>
                {/* Выбор Квартала */}
                <DatePicker
                    picker="quarter"
                    onChange={handleQuarterChange}
                    defaultValue={dayjs()}
                    disabledDate={disabledDate}
                    className="rounded-2"
                    allowClear={false}
                    style={{width: 200}}
                />
            </div>


            {loading ? (
                <Preloader/>
            ) : (
                <>
                    {/* KPI Cards (без изменений) */}
                    <Row gutter={[16, 16]}>
                        <Col span={6}>
                            <Card size='small' className="shadow-sm">
                                <Statistic
                                    title={<Text strong style={{fontSize: '11px'}}>ПОДТВЕРЖДЕННЫЙ ФРОД <Tooltip
                                        title="Точность (Precision)"><InfoCircleOutlined/></Tooltip></Text>}
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
                                    title={<Text strong style={{fontSize: '11px'}}>ПОЛНОТА (RECALL) <Tooltip
                                        title="Доля выявленных мошеннических операций"><InfoCircleOutlined/></Tooltip></Text>}
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
                                    title={<Text strong style={{fontSize: '11px'}}>ЛОЖНЫЕ (FPR) <Tooltip
                                        title="Ошибочные блокировки"><InfoCircleOutlined/></Tooltip></Text>}
                                    value={stats.falsePositiveRate}
                                    valueStyle={{color: stats.falsePositiveRate === '0.00%' ? '#52c41a' : '#faad14'}}
                                    prefix={<WarningTwoTone twoToneColor="#faad14"/>}
                                />
                                <Text type="secondary" style={{fontSize: '11px'}}>Ложные срабатывания</Text>
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card size='small' className="shadow-sm">
                                <Statistic
                                    title={<Text strong style={{fontSize: '11px'}} className="text-primary">В ОЧЕРЕДИ
                                        (WAIT)</Text>}
                                    value={stats.unprocessedAlerts}
                                    valueStyle={{color: stats.unprocessedAlerts > 0 ? '#ff4d4f' : '#52c41a'}}
                                    prefix={<ThunderboltTwoTone
                                        twoToneColor={stats.unprocessedAlerts > 0 ? '#ff4d4f' : '#52c41a'}/>}
                                />
                                <Text type="secondary" style={{fontSize: '11px'}}>Ожидают решения</Text>
                            </Card>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]} className="mt-3">
                        <Col span={14}>
                            <Card
                                title={<Text strong>Топ сработавших правил ({stats.documentedMethodsCount})</Text>}
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
                                            title={<Tooltip title="Mean time to detect (Среднее время автоматического обнаружения)">Детекция
                                                (MTTD) <InfoCircleOutlined/></Tooltip>}
                                            value={formatTime(stats.mttdMin, true)}
                                            valueStyle={{fontSize: '18px', fontWeight: 'bold'}}
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Statistic
                                            title={<Tooltip title="Mean time to respond (Среднее время реакции человека)">Реакция
                                                (MTTR) <InfoCircleOutlined/></Tooltip>}
                                            value={formatTime(stats.mttrMin)}
                                            valueStyle={{fontSize: '18px', fontWeight: 'bold'}}
                                        />
                                    </Col>
                                </Row>

                                <div className="mb-4">
                                    <div className="d-flex justify-content-between mb-1">
                                        <Text type="secondary" style={{fontSize: '12px'}}>Разбор очереди
                                            инцидентов</Text>
                                        <Text strong>{quality.actualization || 0}%</Text>
                                    </div>
                                    <Progress percent={quality.actualization} size="small"
                                              status={quality.actualization < 80 ? "exception" : "success"}
                                              strokeWidth={8} showInfo={false}/>
                                    <div className="d-flex justify-content-between mt-1">
                                        <Text style={{fontSize: '10px'}}
                                              type="secondary">Всего: {MoneyFormatNumber(stats.totalTransactions)}</Text>
                                        <Text style={{fontSize: '10px'}} type="danger">В
                                            ожидании: {stats.unprocessedAlerts}</Text>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <div className="d-flex justify-content-between mb-1">
                                        <Text type="secondary" style={{fontSize: '12px'}}>Детализация логов
                                            (Snapshot)</Text>
                                        <Text strong>{quality.fullness || 0}%</Text>
                                    </div>
                                    <Progress percent={quality.fullness} size="small" strokeWidth={8} showInfo={false}/>
                                </div>

                                <div
                                    className="p-2 bg-light rounded-2 border border-dashed d-flex align-items-center justify-content-between">
                                    <Text type="secondary" style={{fontSize: '12px'}}>Лояльность системы:</Text>
                                    <Tag color="green" className="m-0">Разрешение
                                        споров: {stats.customerResolutionRate}</Tag>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </>
            )}

        </div>
    );
};

export default AntiFraudStatsDashboard;
