import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Card, Col, Divider, message, Row, Statistic, Tag, Typography} from 'antd';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChartLine, faSquare, faWallet} from "@fortawesome/free-solid-svg-icons";
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

const {Text, Title} = Typography;

// --- Вспомогательные компоненты ---
const AnalyticsTooltip = ({active, payload, label}) => {
    if (active && payload && payload.length) {
        return (
            // Добавлена обертка с pointer-events: none, чтобы тултип не мерцал при наведении
            <div className="card card-body shadow-sm border-0"
                 style={{
                     minWidth: '220px',
                     zIndex: 1050,
                     pointerEvents: 'none',
                     backgroundColor: 'rgba(255, 255, 255, 0.96)'
                 }}>
                <Text type="secondary" className="mb-2 d-block small">{`Данные за ${label}`}</Text>
                {payload.map((item, idx) => (
                    <div key={idx} className="d-flex align-items-center justify-content-between mb-1">
                        <div className="d-flex align-items-center gap-2">
                            <FontAwesomeIcon
                                icon={faSquare}
                                style={{color: item.stroke || item.fill, fontSize: '10px'}}
                            />
                            <span className="small">{item.name}:</span>
                        </div>
                        <span className="fw-bold small ms-3">{item.value}</span>
                    </div>
                ))}
                <Divider className="my-2"/>
                <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold small">Итого:</span>
                    <span className="fw-bold small text-primary">
                        {payload.reduce((sum, item) => sum + (Number(item.value) || 0), 0)}
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

// --- Основной компонент ---

const ProfileDetails = ({record, session, apparatsList, token}) => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({current: 1, pageSize: 100});

    // Обработка данных для графиков
    const chartData = useMemo(() => {
        if (!payments.length) return {timeline: [], terminals: [], hourly: []};

        const timelineMap = {};
        const terminalMap = {};
        const hourlyMap = Array.from({length: 24}, (_, i) => ({hour: `${i}:00`, count: 0}));

        payments.forEach(p => {
            const date = dayjs(p.createdAt).format('DD.MM');
            const hour = dayjs(p.createdAt).hour();
            const app = findById(apparatsList, p.apparat_id);
            const appName = `${app.name} ${app.id}` || `ID ${p.apparat_id}`;

            if (!timelineMap[date]) {
                timelineMap[date] = {day: date, success: 0, decline: 0, wait: 0, total: 0};
            }

            if (['allow', 'approve'].includes(p.action)) timelineMap[date].success++;
            else if (['reject', 'deny'].includes(p.action)) timelineMap[date].decline++;
            else timelineMap[date].wait++;

            terminalMap[appName] = (terminalMap[appName] || 0) + 1;
            hourlyMap[hour].count++;
            timelineMap[date].total++;
        });

        return {
            timeline: Object.values(timelineMap).reverse(),
            terminals: Object.keys(terminalMap).map(k => ({name: k, count: terminalMap[k]})),
            hourly: hourlyMap
        };
    }, [payments, apparatsList]);

    const totalAmount = useMemo(() =>
            payments.reduce((sum, p) => sum + Number(p.amount), 0),
        [payments]);

    // Колонки таблицы
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
                return <span
                    className="af-text-sm fw-medium">{app.id ? `${app.id} ${app.name}` : `Точка #${id}`}</span>;
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
                const root = Array.isArray(res) ? res[0] : (res.data?.[0] || res.data);
                setPayments(root?.history || []);
            }
        } catch (e) {
            message.error("Ошибка загрузки");
        } finally {
            setLoading(false);
        }
    }, [record.id, session]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return (
        <div className="p-3">
            <ProfileWhitelistCard client={record}/>

            <Divider orientation="left" plain className="my-4">
                <Title level={5} className="m-0">Аналитические сводки</Title>
            </Divider>

            <Row gutter={[16, 16]} className="mb-4">
                {/* Карточки статистики */}
                <Col span={5}>
                    <div className="d-flex flex-column gap-3 h-100">
                        <Card bordered size="small" className="shadow-sm rounded-3">
                            <Statistic
                                title={<Text type="secondary" className="small">Всего транзакций</Text>}
                                value={payments.length}
                                valueStyle={{fontSize: '20px', fontWeight: 600}}
                                prefix={
                                    <FontAwesomeIcon icon={faChartLine} className="me-2 fs-6"
                                                     style={{color: token.colorPrimary}}/>
                                }
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

                {/* Активность по часам */}
                <Col span={11}>
                    <Card
                        title={
                            <span className="fw-bold small">Пики активности (24ч)</span>
                        }
                        size="small"
                        className="shadow-sm">
                        <div style={{height: 120, width: '100%'}}>
                            <ResponsiveContainer>
                                <AreaChart data={chartData.hourly} margin={{top: 10, right: 20, left: -25, bottom: 0}}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0"/>
                                    <XAxis
                                        dataKey="hour"
                                        axisLine={false}
                                        interval={1}
                                        tickLine={false}
                                        tick={{fontSize: 10, fill: '#bfbfbf',}}
                                        padding={{left: 10, right: 10}} // Предотвращает обрезание крайних меток
                                    />
                                    <YAxis axisLine={false} tickLine={false} allowDecimals={false} minTickGap={1}
                                           tick={{fontSize: 10, fill: '#bfbfbf'}} domain={[0, 'dataMax']}/>
                                    {/* position: { y: 0 } фиксирует тултип по высоте, чтобы он не прыгал */}
                                    <Tooltip content={<AnalyticsTooltip/>} usePortal={true}/>
                                    <Area
                                        name="Транзакции"
                                        type="monotone"
                                        dataKey="count"
                                        stroke={token.colorPrimary}
                                        fill={token.colorPrimary}
                                        fillOpacity={0.2}
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>

                {/* Распределение по точкам — горизонтальный Bar с улучшенным видом */}
                <Col span={8}>
                    <Card title={<span className="fw-bold small">Распределение по точкам</span>} size="small"
                          className="shadow-sm">
                        <div style={{height: 120, width: '100%'}}>
                            <ResponsiveContainer>
                                <BarChart
                                    data={chartData.terminals}
                                    layout="vertical"
                                    margin={{top: 5, right: 15, left: 10, bottom: 5}}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0"/>
                                    <XAxis type="number" hide domain={[0, 'dataMax']}/>
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={70}
                                        tick={{fontSize: 10, fill: '#8c8c8c'}}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        content={<AnalyticsTooltip/>}
                                        allowEscapeViewBox={{x: true, y: true}}
                                        // coordinate.x — это позиция мыши. Вычитаем 240, чтобы тултип был слева.
                                        position={{y: 10}} // Фиксируем по высоте, чтобы не прыгал
                                        wrapperStyle={{left: -240, transition: 'none'}} // Сдвигаем контейнер влево
                                    />
                                    <Bar
                                        name="Кол-во"
                                        dataKey="count"
                                        radius={[0, 4, 4, 0]}
                                        barSize={14}
                                    >
                                        {chartData.terminals.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={token.colorInfo}
                                                fillOpacity={0.7}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
                {/* Основной график динамики */}
                <Col span={24}>
                    <Card
                        title={<span className="fw-bold small">Динамика платежей</span>}
                        size="small"
                        className="shadow-sm border-0" // Добавил border-0 для чистоты стиля
                    >
                        <div style={{height: 250, width: '100%'}}> {/* Немного увеличил высоту для лучшей читаемости */}
                            <ResponsiveContainer>
                                <AreaChart data={chartData.timeline}
                                           margin={{top: 10, right: 30, left: -20, bottom: 20}}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0"/>
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 11}}/>
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11}} allowDecimals={false} minTickGap={1}/>
                                    <Tooltip content={<AnalyticsTooltip/>} usePortal={true}/>

                                    {/* Секции со своими четкими линиями */}
                                    <Area
                                        name="Успешные"
                                        type="monotone"
                                        dataKey="success"
                                        stackId="1"
                                        stroke="#52c41a"      // Четкая зеленая линия
                                        strokeWidth={1}
                                        fill="#52c41a"
                                        fillOpacity={0.5}
                                    />
                                    <Area
                                        name="Отклоненные"
                                        type="monotone"
                                        dataKey="decline"
                                        stackId="1"
                                        stroke="#ff4d4f"      // Четкая красная линия
                                        strokeWidth={1}
                                        fill="#ff4d4f"
                                        fillOpacity={0.5}
                                    />
                                    <Area
                                        name="В обработке"
                                        type="monotone"
                                        dataKey="wait"
                                        stackId="1"
                                        stroke="#faad14"      // Четкая желтая линия
                                        strokeWidth={1}
                                        fill="#faad14"
                                        fillOpacity={0.5}
                                    />

                                    {/* ГЛАВНАЯ ИТОГОВАЯ ЛИНИЯ (без stackId, чтобы не зависела от порядка секторов) */}
                                    <Area
                                        name="Итого"
                                        type="monotone"
                                        dataKey="total"      // Используем заранее вычисленное итоговое значение
                                        stroke="darkBlue"     // Глубокий синий контур
                                        strokeWidth={2}      // Жирная линия сверху
                                        fill="none"          // Без заливки
                                        isAnimationActive={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Divider orientation="left" plain className="mb-4">
                <Title level={5} className="m-0">История платежей</Title>
            </Divider>

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
