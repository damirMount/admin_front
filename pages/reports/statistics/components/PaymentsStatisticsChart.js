import React, {useEffect, useMemo, useState} from "react";
import {Card, Radio, Typography} from "antd";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faArrowTrendUp, faCheckCircle, faCircle, faTimesCircle} from '@fortawesome/free-solid-svg-icons';
import {Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {MoneyFormatNumber} from "../../../../components/main/system/MoneyFormatNumber"; // Проверьте правильность пути

const {Text, Title} = Typography;

export default function PaymentsStatisticsChart({statistics, totalSummary}) {
    const [timeGranularity, setTimeGranularity] = useState("day");

    // Автоматическое определение шага времени при обновлении статистики
    useEffect(() => {
        if (!statistics || statistics.length === 0) return;

        const uniqueDates = new Set(statistics.map(item => item.date).filter(Boolean));
        const hasHourly = statistics.some(item => item.additional_data?.hourly);

        if (uniqueDates.size === 1 && hasHourly) {
            setTimeGranularity("hour");
        } else {
            setTimeGranularity("day");
        }
    }, [statistics]);

    const hasHourlyData = useMemo(() => {
        return statistics.some(item => item.additional_data?.hourly);
    }, [statistics]);

    const chartData = useMemo(() => {
        if (!statistics || statistics.length === 0) return [];

        if (timeGranularity === "hour") {
            const hourlyMap = Array.from({length: 24}, (_, i) => ({
                displayHour: `${String(i).padStart(2, '0')}:00`,
                success_total_pay: 0,
                fail_total_pay: 0,
                total_pay: 0,
                success_total_count: 0,
                fail_total_count: 0,
                total_count: 0
            }));

            statistics.forEach(item => {
                const hourlyData = item.additional_data?.hourly;
                if (!hourlyData) return;

                const isSuccess = String(item.payments_status || "").toLowerCase() === "success";
                const totalAmount = Number(item.total || 0);

                const itemHourlyTotalCount = Object.values(hourlyData).reduce((sum, val) => sum + Number(val || 0), 0);

                Object.entries(hourlyData).forEach(([hourStr, countVal]) => {
                    const hourInt = parseInt(hourStr, 10);
                    if (hourInt >= 0 && hourInt < 24) {
                        const cnt = Number(countVal || 0);
                        const proportionalMoney = itemHourlyTotalCount > 0 ? (cnt / itemHourlyTotalCount) * totalAmount : 0;

                        if (isSuccess) {
                            hourlyMap[hourInt].success_total_count += cnt;
                            hourlyMap[hourInt].success_total_pay += proportionalMoney;
                        } else {
                            hourlyMap[hourInt].fail_total_count += cnt;
                            hourlyMap[hourInt].fail_total_pay += proportionalMoney;
                        }
                        hourlyMap[hourInt].total_count += cnt;
                        hourlyMap[hourInt].total_pay += proportionalMoney;
                    }
                });
            });
            return hourlyMap;
        }

        const groupMap = {};

        statistics.forEach(item => {
            if (!item.date) return;
            const dateObj = new Date(item.date);
            if (isNaN(dateObj.getTime())) return;

            let groupKey = item.date;

            if (timeGranularity === "week") {
                const day = dateObj.getDay();
                const diff = dateObj.getDate() - day + (day === 0 ? -6 : 1);
                const monday = new Date(dateObj.setDate(diff));
                groupKey = monday.toISOString().split('T')[0];
            } else if (timeGranularity === "month") {
                groupKey = item.date.substring(0, 7);
            }

            if (!groupMap[groupKey]) {
                groupMap[groupKey] = {
                    date: groupKey,
                    success_total_pay: 0,
                    fail_total_pay: 0,
                    total_pay: 0,
                    success_total_count: 0,
                    fail_total_count: 0,
                    total_count: 0
                };
            }

            const total = Number(item.real_pay || 0);
            const count = Number(item.count || 0);

            if (String(item.payments_status).toLowerCase() === 'success') {
                groupMap[groupKey].success_total_pay += total;
                groupMap[groupKey].success_total_count += count;
            } else {
                groupMap[groupKey].fail_total_pay += total;
                groupMap[groupKey].fail_total_count += count;
            }
            groupMap[groupKey].total_pay += total;
            groupMap[groupKey].total_count += count;
        });

        return Object.values(groupMap).sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [statistics, timeGranularity]);

    const formatXAxisTick = (value) => {
        if (!value) return "";
        if (timeGranularity === "hour") return value;

        const date = new Date(value);
        if (isNaN(date.getTime())) return value;

        if (timeGranularity === "day") {
            return date.toLocaleDateString('ru-RU', {day: '2-digit', month: 'short'}).replace('.', '');
        }
        if (timeGranularity === "week") {
            const endOfWeek = new Date(date);
            endOfWeek.setDate(endOfWeek.getDate() + 6);
            return `${date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit'
            })} - ${endOfWeek.toLocaleDateString('ru-RU', {day: '2-digit', month: '2-digit'})}`;
        }
        if (timeGranularity === "month") {
            return date.toLocaleDateString('ru-RU', {month: 'short', year: '2-digit'}).replace('.', '');
        }
        return value;
    };

    const ChartTooltip = ({active, payload}) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            let title = "";

            if (timeGranularity === "hour") {
                title = `Время: ${data.displayHour}`;
            } else if (timeGranularity === "day") {
                title = new Date(data.date).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
            } else if (timeGranularity === "week") {
                const start = new Date(data.date);
                const end = new Date(start);
                end.setDate(end.getDate() + 6);
                title = `Неделя: ${start.toLocaleDateString('ru-RU')} - ${end.toLocaleDateString('ru-RU')}`;
            } else if (timeGranularity === "month") {
                title = new Date(data.date + "-01").toLocaleDateString('ru-RU', {month: 'long', year: 'numeric'});
            }

            return (
                <div className="bg-white p-3 rounded-3 shadow border-0"
                     style={{minWidth: '260px', backdropFilter: 'blur(4px)'}}>
                    <Text type="secondary" className="d-block mb-2 font-monospace"
                          style={{fontSize: '12px'}}>{title}</Text>
                    <div className="d-flex justify-content-between mb-2">
                        <span className="fw-semibold text-dark">Финансовый оборот:</span>
                        <Text strong className="text-primary">{MoneyFormatNumber(data.total_pay)}</Text>
                    </div>
                    <div className="border-top my-2"></div>
                    <div className="d-flex justify-content-between mb-1" style={{fontSize: '13px'}}>
                        <span className="text-muted"><FontAwesomeIcon icon={faCircle} className="text-success me-1"
                                                                      style={{fontSize: '8px'}}/> Успешные:</span>
                        <Text strong className="text-success">{data.success_total_count} шт.</Text>
                    </div>
                    <div className="d-flex justify-content-between mb-2" style={{fontSize: '13px'}}>
                        <span className="text-muted"><FontAwesomeIcon icon={faCircle} className="text-danger me-1"
                                                                      style={{fontSize: '8px'}}/> Ошибки:</span>
                        <Text strong className="text-danger">{data.fail_total_count} шт.</Text>
                    </div>
                    <div className="border-top my-2"></div>
                    <div className="d-flex justify-content-between bg-light p-2 rounded-2">
                        <span className="text-dark fw-semibold">Всего транзакций:</span>
                        <Text strong style={{color: '#4c3a75'}}>{data.total_count} шт.</Text>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <Card
            className="shadow-sm border"
            style={{borderRadius: '12px', overflow: 'hidden'}}
            title={
                <div className="d-flex flex-wrap align-items-center justify-content-between py-2 gap-3">
                    <div>
                        <Title level={4} className="m-0 fw-bold text-dark d-flex align-items-center gap-2"
                               style={{letterSpacing: '-0.5px'}}>
                            <FontAwesomeIcon icon={faArrowTrendUp} className="text-primary"
                                             style={{fontSize: '18px'}}/> Динамика транзакций и оборота
                        </Title>
                    </div>
                    <div className="d-flex flex-wrap align-items-center gap-4">
                        <div className="bg-light px-3 py-2 rounded-3 border d-flex align-items-center gap-2">
                            <FontAwesomeIcon icon={faCircle} style={{color: '#3b82f6', fontSize: '10px'}}/>
                            <div className="d-flex flex-column">
                                <span className="fw-bold text-dark lh-1"
                                      style={{fontSize: '16px'}}>{MoneyFormatNumber(totalSummary.all.real_pay)}</span>
                                <span className="text-muted" style={{fontSize: '11px'}}>общий оборот</span>
                            </div>
                        </div>
                        <div className="bg-light px-3 py-2 rounded-3 border d-flex align-items-center gap-2">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-success" style={{fontSize: '12px'}}/>
                            <div className="d-flex flex-column">
                                <span className="fw-bold text-success lh-1"
                                      style={{fontSize: '16px'}}>{MoneyFormatNumber(totalSummary.success.count, 'full')} шт.</span>
                                <span className="text-muted" style={{fontSize: '11px'}}>успешно</span>
                            </div>
                        </div>
                        <div className="bg-light px-3 py-2 rounded-3 border d-flex align-items-center gap-2">
                            <FontAwesomeIcon icon={faTimesCircle} className="text-danger" style={{fontSize: '12px'}}/>
                            <div className="d-flex flex-column">
                                <span className="fw-bold text-danger lh-1"
                                      style={{fontSize: '16px'}}>{MoneyFormatNumber(totalSummary.fail.count, 'full')} шт.</span>
                                <span className="text-muted" style={{fontSize: '11px'}}>ошибки</span>
                            </div>
                        </div>
                    </div>
                </div>
            }
            extra={
                <Radio.Group
                    value={timeGranularity}
                    onChange={(e) => setTimeGranularity(e.target.value)}
                    size="middle"
                    buttonStyle="solid"
                    className="shadow-sm rounded-2 ms-3"
                >
                    <Radio.Button value="hour" disabled={!hasHourlyData}>Часы</Radio.Button>
                    <Radio.Button value="day">Дни</Radio.Button>
                    <Radio.Button value="week">Недели</Radio.Button>
                    <Radio.Button value="month">Месяцы</Radio.Button>
                </Radio.Group>
            }
        >
            <div style={{width: '100%', height: 380, marginTop: '20px'}}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}
                                   margin={{top: 10, right: -10, bottom: 10, left: -10}}>
                        <CartesianGrid  strokeDasharray="3 3"/>
                        <XAxis
                            dataKey={timeGranularity === "hour" ? "displayHour" : "date"}
                            tickFormatter={formatXAxisTick}
                            tickLine={false}
                            axisLine={false}
                            tick={{fontSize: 11, fill: '#64748b', fontWeight: 500}}
                            dy={10}
                        />
                        <YAxis
                            yAxisId="left"
                            tickFormatter={(val) => MoneyFormatNumber(val, 'short')}
                            tickLine={false}
                            axisLine={false}
                            tick={{fontSize: 11, fill: '#64748b'}}
                        />
                        <YAxis
                            yAxisId="right"
                            tickFormatter={(val) => MoneyFormatNumber(val, 'full')}
                            orientation="right"
                            tickLine={false}
                            axisLine={false}
                            tick={{fontSize: 11, fill: '#64748b'}}
                        />
                        <Tooltip content={<ChartTooltip/>}
                                 cursor={{fill: '#f8fafc', opacity: 0.6}}/>

                        <Bar
                            yAxisId="right"
                            dataKey="success_total_count"
                            stackId="countStack"
                            fill="#10b981"
                            opacity={0.85}
                            maxBarSize={28}
                        />
                        <Bar
                            yAxisId="right"
                            dataKey="fail_total_count"
                            stackId="countStack"
                            fill="#f43f5e"
                            opacity={0.9}
                            maxBarSize={28}
                        />

                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="total_pay"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{
                                r: 3,
                                stroke: '#3b82f6',
                                strokeWidth: 2,
                                fill: '#fff'
                            }}
                            activeDot={{r: 5, strokeWidth: 0}}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}