import Head from "next/head";
import React, { useMemo, useState } from "react";
import ProtectedElement from "../../../components/main/system/ProtectedElement";
import PaymentsFilterForm from "./components/PaymentsFilterForm";
import PaymentsStatisticsTable from "./components/PaymentsStatisticsTable";
import { Typography, Card, Empty, List, Radio, Badge } from "antd";
import { useAlert } from "../../../contexts/AlertContext";
import { useSession } from "next-auth/react";
import usePaymentsStatisticActions from "./hooks/usePaymentsStatisticActions";
import usePaymentsStatisticsData from "./hooks/usePaymentsStatisticsData";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faCheckCircle, faTimesCircle, faTrendingUp } from '@fortawesome/free-solid-svg-icons';
import { ComposedChart, Bar, Line, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MoneyFormatNumber } from "../../../components/main/system/MoneyFormatNumber";

const { Text, Title } = Typography;

export default function PaymentsStatisticsPage() {
    const { openNotification } = useAlert();
    const { data: session } = useSession();

    const [loading, setLoading] = useState(false);
    const [statistics, setStatistics] = useState([]);
    const [timeGranularity, setTimeGranularity] = useState("day"); // "hour" | "day" | "week" | "month"
    const [filterModes, setFilterModes] = useState({
        dealer: "total",
        server: "total",
        service: "total",
        apparat: "total"
    });
    const [paymentsStatus, setPaymentsStatus] = useState(undefined);

    const { getPaymentsStatistics } = usePaymentsStatisticActions(session, openNotification);
    const { dictionaries } = usePaymentsStatisticsData(session, setLoading);

    // ИЗМЕНЕНО: Добавлена автоматическая смена детализации при поиске
    const handleSearch = async (formValues, currentModes) => {
        setLoading(true);
        if (currentModes) {
            setFilterModes(currentModes);
        }
        setPaymentsStatus(formValues?.payments_status);

        const resultData = await getPaymentsStatistics(formValues);
        const fetchedStats = resultData || [];
        setStatistics(fetchedStats);

        // Проверяем: сколько уникальных дней пришло в ответе
        const uniqueDates = new Set(fetchedStats.map(item => item.date).filter(Boolean));
        const hasHourly = fetchedStats.some(item => item.additional_data?.hourly);

        // Если пришёл ровно 1 уникальный день и есть почасовые данные -> включаем "Часы"
        if (uniqueDates.size === 1 && hasHourly) {
            setTimeGranularity("hour");
        } else {
            setTimeGranularity("day"); // Для любого другого периода по умолчанию ставим "Дни"
        }

        setLoading(false);
    };

    const hasHourlyData = useMemo(() => {
        return statistics.some(item => item.additional_data?.hourly);
    }, [statistics]);

    const totalSummary = useMemo(() => {
        return statistics.reduce((acc, curr) => {
            const isSuccess = String(curr.payments_status || "").toLowerCase() === "success";
            acc.all.count += Number(curr.count || 0);
            acc.all.total += Number(curr.total || 0);
            acc.all.real_pay += Number(curr.real_pay || 0);
            acc.all.real_pay_rur += Number(curr.real_pay_rur || 0);
            acc.all.commission += Number(curr.commission || 0);

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

    const chartData = useMemo(() => {
        if (!statistics || statistics.length === 0) return [];

        if (timeGranularity === "hour") {
            const hourlyMap = Array.from({ length: 24 }, (_, i) => ({
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

            const total = Number(item.total || 0);
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
            return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }).replace('.', '');
        }
        if (timeGranularity === "week") {
            const endOfWeek = new Date(date);
            endOfWeek.setDate(endOfWeek.getDate() + 6);
            return `${date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })} - ${endOfWeek.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}`;
        }
        if (timeGranularity === "month") {
            return date.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' }).replace('.', '');
        }
        return value;
    };

    const ChartTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            let title = "";

            if (timeGranularity === "hour") {
                title = `Время: ${data.displayHour}`;
            } else if (timeGranularity === "day") {
                title = new Date(data.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
            } else if (timeGranularity === "week") {
                const start = new Date(data.date);
                const end = new Date(start);
                end.setDate(end.getDate() + 6);
                title = `Неделя: ${start.toLocaleDateString('ru-RU')} - ${end.toLocaleDateString('ru-RU')}`;
            } else if (timeGranularity === "month") {
                title = new Date(data.date + "-01").toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
            }

            return (
                <div className="bg-white p-3 rounded-3 shadow border-0" style={{ minWidth: '260px', backdropFilter: 'blur(4px)' }}>
                    <Text type="secondary" className="d-block mb-2 font-monospace" style={{ fontSize: '12px' }}>{title}</Text>

                    <div className="d-flex justify-content-between mb-2">
                        <span className="fw-semibold text-dark">Финансовый оборот:</span>
                        <Text strong className="text-primary">{MoneyFormatNumber(data.total_pay)}</Text>
                    </div>

                    <div className="border-top my-2"></div>

                    <div className="d-flex justify-content-between mb-1" style={{ fontSize: '13px' }}>
                        <span className="text-muted"><FontAwesomeIcon icon={faCircle} className="text-success me-1" style={{fontSize: '8px'}}/> Успешные:</span>
                        <Text strong className="text-success">{data.success_total_count} шт.</Text>
                    </div>
                    <div className="d-flex justify-content-between mb-2" style={{ fontSize: '13px' }}>
                        <span className="text-muted"><FontAwesomeIcon icon={faCircle} className="text-danger me-1" style={{fontSize: '8px'}}/> Ошибки:</span>
                        <Text strong className="text-danger">{data.fail_total_count} шт.</Text>
                    </div>

                    <div className="border-top my-2"></div>
                    <div className="d-flex justify-content-between bg-light p-2 rounded-2">
                        <span className="text-dark fw-semibold">Всего транзакций:</span>
                        <Text strong style={{ color: '#4c3a75' }}>{data.total_count} шт.</Text>
                    </div>
                </div>
            );
        }
        return null;
    };

    const tops = useMemo(() => {
        const getTopByDimension = (dimensionKey, dictArray, dictNameField = 'name') => {
            const summaryMap = {};
            statistics.forEach(item => {
                const id = item[dimensionKey];
                if (id === null || id === undefined) return;

                if (!summaryMap[id]) {
                    summaryMap[id] = { id, total: 0, count: 0 };
                }
                summaryMap[id].total += Number(item.total || 0);
                summaryMap[id].count += Number(item.count || 0);
            });

            const result = Object.values(summaryMap).map(entry => {
                const foundItem = dictArray?.find(d => String(d.id) === String(entry.id));
                const entityName = foundItem?.[dictNameField];
                const entityLogo = foundItem?.src_small || foundItem?.src;

                return {
                    ...entry,
                    name: entityName || `ID: ${entry.id}`,
                    logo: entityLogo || null,
                };
            });

            return result.sort((a, b) => b.total - a.total).slice(0, 5);
        };

        return {
            dealers: getTopByDimension('dealer_id', dictionaries?.dealers),
            services: getTopByDimension('service_id', dictionaries?.services),
            apparats: getTopByDimension('apparat_id', dictionaries?.apparats)
        };
    }, [statistics, dictionaries]);

    const RenderTopCard = ({ title, data, emptyMessage, showImage = false }) => (
        <Card title={<span className="fw-bold text-dark fs-6">{title}</span>} size="small" bordered={false} className="shadow-sm flex-fill mx-2 mb-3 border" style={{ borderRadius: '12px', minWidth: '290px', backgroundColor: '#fff' }}>
            {data.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className="text-muted" style={{ fontSize: '12px' }}>{emptyMessage}</span>} />
            ) : (
                <List
                    size="small"
                    dataSource={data}
                    renderItem={(item, index) => (
                        <List.Item className="d-flex justify-content-between align-items-center px-1 py-2 border-0 rounded-2 item-hover-effect">
                            <div className="d-flex align-items-center text-truncate me-2" style={{ maxWidth: '75%', minWidth: 0 }}>
                                <span className="badge rounded-circle me-2 d-flex align-items-center justify-content-center fw-bold"
                                      style={{ width: '22px', height: '22px', fontSize: '11px', backgroundColor: index < 3 ? '#f1f5f9' : 'transparent', color: index < 3 ? '#475569' : '#94a3b8' }}>
                                    {index + 1}
                                </span>

                                {showImage && (
                                    <img
                                        src={`https://kg.quickpay.kg/kassir/${item.logo || ''}`}
                                        style={{ width: '24px', height: '24px', objectFit: 'contain', borderRadius: '6px', backgroundColor: '#f8fafc' }}
                                        className="me-2 flex-shrink-0 border p-0.5"
                                        alt=""
                                    />
                                )}

                                <Text className="text-dark text-truncate fw-medium" title={item.name} style={{fontSize: '13px'}}>{item.name}</Text>
                            </div>
                            <Text className="fw-bold text-end flex-shrink-0" style={{ color: '#522c58', fontSize: '13px' }}>{MoneyFormatNumber(item.total, 'short')}</Text>
                        </List.Item>
                    )}
                />
            )}
        </Card>
    );

    return (
        <ProtectedElement allowedPermissions={"reports_management"}>
            <div className="container-fluid px-0" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
                <Head>
                    <title>Статистика платежей | {process.env.NEXT_PUBLIC_APP_NAME}</title>
                </Head>

                <PaymentsFilterForm onSearch={handleSearch} loading={loading} dictionaries={dictionaries} totalSummary={totalSummary} />

                {statistics.length > 0 && (
                    <div className="row  ">
                        {/* ГРАФИК ДИНАМИКИ */}
                        <div className="col-12 px-2 mb-4">
                            <Card
                                bordered={false}
                                className="shadow-sm border"
                                style={{ borderRadius: '12px', overflow: 'hidden' }}
                                title={
                                    <div className="d-flex flex-wrap align-items-center justify-content-between py-2 gap-3">
                                        <div>
                                            <Title level={4} className="m-0 fw-bold text-dark d-flex align-items-center gap-2" style={{ letterSpacing: '-0.5px' }}>
                                                <FontAwesomeIcon icon={faTrendingUp} className="text-primary" style={{fontSize: '18px'}} /> Динамика транзакций и оборота
                                            </Title>
                                        </div>

                                        {/* Счётчики в шапке */}
                                        <div className="d-flex flex-wrap align-items-center gap-4">
                                            <div className="bg-light px-3 py-2 rounded-3 border d-flex align-items-center gap-2">
                                                <FontAwesomeIcon icon={faCircle} style={{ color: '#3b82f6', fontSize: '10px' }} />
                                                <div className="d-flex flex-column">
                                                    <span className="fw-bold text-dark lh-1" style={{fontSize: '16px'}}>{MoneyFormatNumber(totalSummary.all.total)}</span>
                                                    <span className="text-muted" style={{ fontSize: '11px' }}>общий оборот</span>
                                                </div>
                                            </div>

                                            <div className="bg-light px-3 py-2 rounded-3 border d-flex align-items-center gap-2">
                                                <FontAwesomeIcon icon={faCheckCircle} className="text-success" style={{ fontSize: '12px' }} />
                                                <div className="d-flex flex-column">
                                                    <span className="fw-bold text-success lh-1" style={{fontSize: '16px'}}>{MoneyFormatNumber(totalSummary.success.count, 'full')} шт.</span>
                                                    <span className="text-muted" style={{ fontSize: '11px' }}>успешно</span>
                                                </div>
                                            </div>

                                            <div className="bg-light px-3 py-2 rounded-3 border d-flex align-items-center gap-2">
                                                <FontAwesomeIcon icon={faTimesCircle} className="text-danger" style={{ fontSize: '12px' }} />
                                                <div className="d-flex flex-column">
                                                    <span className="fw-bold text-danger lh-1" style={{fontSize: '16px'}}>{MoneyFormatNumber(totalSummary.fail.count, 'full')} шт.</span>
                                                    <span className="text-muted" style={{ fontSize: '11px' }}>ошибки</span>
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
                                <div style={{ width: '100%', height: 380, marginTop: '20px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={chartData} margin={{ top: 10, right: -10, bottom: 10, left: -10 }}>
                                            <CartesianGrid stroke="#f1f5f9" vertical={false} strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey={timeGranularity === "hour" ? "displayHour" : "date"}
                                                tickFormatter={formatXAxisTick}
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                yAxisId="left"
                                                tickFormatter={(val) => MoneyFormatNumber(val, 'short')}
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fontSize: 11, fill: '#64748b' }}
                                            />
                                            <YAxis
                                                yAxisId="right"
                                                orientation="right"
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fontSize: 11, fill: '#64748b' }}
                                            />
                                            <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc', opacity: 0.6 }} />

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
                                                dot={timeGranularity === "hour" ? false : { r: 3, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
                                                activeDot={{ r: 5, strokeWidth: 0 }}
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>

                        {/* БЛОК КАРТОЧЕК ТОП */}
                        <div className="col-12 px-0 mb-3">
                            <div className="d-flex flex-wrap justify-content-between">
                                <RenderTopCard title="🏆 Топ Дилеров" data={tops.dealers} emptyMessage="Выберите группировку 'Разбивка' для дилеров в фильтрах." />
                                <RenderTopCard title="⭐ Топ Сервисов" data={tops.services} emptyMessage="Выберите группировку 'Разбивка' для сервисов в фильтрах." showImage={true} />
                                <RenderTopCard title="📱 Топ Аппаратов" data={tops.apparats} emptyMessage="Выберите группировку 'Разбивка' для аппаратов в фильтрах." />
                            </div>
                        </div>
                    </div>
                )}

                <div className="pb-4">
                    <PaymentsStatisticsTable
                        statistics={statistics}
                        loading={loading}
                        totalSummary={totalSummary}
                        filterModes={filterModes}
                        paymentsStatus={paymentsStatus}
                        dictionaries={dictionaries}
                    />
                </div>
            </div>
        </ProtectedElement>
    );
}