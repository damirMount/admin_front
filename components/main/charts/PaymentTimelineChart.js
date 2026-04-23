import React, { useMemo } from 'react';
import { Area, Line, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ComposedChart } from 'recharts';
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquare } from "@fortawesome/free-solid-svg-icons";
import { Typography, Divider } from "antd";

const { Text } = Typography;

const TimelineTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const total = payload.reduce((sum, item) => {
            if (item.dataKey === 'total') {
                return sum;
            }
            return sum + (Number(item.value) || 0);
        }, 0);

        return (
            <div className="card card-body shadow-sm border-0"
                 style={{ minWidth: '220px', backgroundColor: 'rgba(255, 255, 255, 0.96)', zIndex: 100 }}>
                <Text type="secondary" className="mb-2 d-block small">Дата: {label}</Text>

                {payload.map((item, idx) => {
                    if (item.dataKey === 'total') {
                        return null;
                    }

                    return (
                        <div key={idx} className="d-flex align-items-center justify-content-between mb-1 small">
                            <span>
                                <FontAwesomeIcon
                                    icon={faSquare}
                                    style={{ color: item.color, fontSize: '8px' }}
                                    className="me-2"
                                />
                                {item.name}:
                            </span>
                            <span className="fw-bold">{item.value}</span>
                        </div>
                    );
                })}

                <Divider className="my-2" />
                <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold small">Всего:</span>
                    <span className="fw-bold small text-primary">{total}</span>
                </div>
            </div>
        );
    }
    return null;
};

const PaymentTimelineChart = ({ payments, token }) => {
    const data = useMemo(() => {
        const map = {};

        // 1. Группируем все данные по дням
        payments.forEach((p) => {
            const paymentDate = dayjs(p.createdAt);
            const dateLabel = paymentDate.format('DD.MM');

            if (!map[dateLabel]) {
                map[dateLabel] = {
                    day: dateLabel,
                    success: 0,
                    decline: 0,
                    wait: 0,
                    total: 0,
                    timestamp: paymentDate.startOf('day').valueOf()
                };
            }

            if (['allow', 'approve'].includes(p.action)) {
                map[dateLabel].success++;
            } else if (['reject', 'deny'].includes(p.action)) {
                map[dateLabel].decline++;
            } else {
                map[dateLabel].wait++;
            }

            map[dateLabel].total++;
        });

        // 2. Превращаем в массив и сортируем по дате (от старых к новым)
        const sortedData = Object.values(map).sort((a, b) => {
            return a.timestamp - b.timestamp;
        });

        // 3. Берем последние 30 точек (дней), если их больше 30
        if (sortedData.length > 30) {
            return sortedData.slice(-30);
        }

        return sortedData;
    }, [payments]);

    return (
        <div style={{ height: 250, width: '100%' }}>
            <ResponsiveContainer>
                <ComposedChart data={data} margin={{ top: 10, right: 30, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11 }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11 }}
                        allowDecimals={false}
                    />
                    <Tooltip content={<TimelineTooltip />} />

                    <Area
                        name="Успешно"
                        type="monotone"
                        dataKey="success"
                        stackId="1"
                        stroke="#52c41a"
                        fill="#52c41a"
                        fillOpacity={0.4}
                    />
                    <Area
                        name="Отказ"
                        type="monotone"
                        dataKey="decline"
                        stackId="1"
                        stroke="#ff4d4f"
                        fill="#ff4d4f"
                        fillOpacity={0.3}
                    />
                    <Area
                        name="Ожидание"
                        type="monotone"
                        dataKey="wait"
                        stackId="1"
                        stroke="#faad14"
                        fill="#faad14"
                        fillOpacity={0.3}
                    />

                    <Line
                        name="Итого"
                        type="monotone"
                        dataKey="total"
                        stroke={token.colorPrimary}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                        isAnimationActive={false}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PaymentTimelineChart;
