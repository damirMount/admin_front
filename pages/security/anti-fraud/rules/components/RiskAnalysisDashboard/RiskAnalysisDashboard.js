import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChartLine} from "@fortawesome/free-solid-svg-icons";
import {Table, Tag, Typography} from "antd";
import React, {useMemo} from "react";

const {Text, Title} = Typography;

const RiskAnalysisDashboard = ({rules, serviceTypes, setFilterServiceId}) => {
    const serviceStatsData = useMemo(() => {
        const stats = {};
        serviceTypes.forEach((service) => {
            stats[service.id] = {
                id: service.id, name: service.name, rules: [],
                basePoints: 0, multipliers: [], minBasePoints: 0, minMultipliers: []
            };
        });

        rules.forEach((rule) => {
            if (!rule.is_active) return;
            const score = Number(rule.params?.risk_value || 0);
            const actionType = rule.params?.action_type || 'add';
            const timeRange = rule.params?.time_range;
            const workingDays = rule.params?.working_days;
            const isAlwaysActive = (!timeRange || timeRange.length === 0) && (!workingDays || workingDays.length === 0);

            const isBlockTransaction = actionType === 'block';
            const targets = rule.service_types_ids?.length > 0 ? rule.service_types_ids : serviceTypes.map(s => s.id);

            targets.forEach((id) => {
                if (stats[id]) {
                    stats[id].rules.push({name: rule.name, score, isBlockTransaction, isAlwaysActive});
                    if (!isBlockTransaction) {
                        if (actionType === 'multiply') stats[id].multipliers.push(score);
                        else stats[id].basePoints += score;
                        if (isAlwaysActive) {
                            if (actionType === 'multiply') stats[id].minMultipliers.push(score);
                            else stats[id].minBasePoints += score;
                        }
                    }
                }
            });
        });

        return Object.values(stats).map((s) => {
            const calculateRisk = (base, mults) => {
                let result = (base === 0 && mults.length > 0) ? 1 : base;
                mults.forEach((m) => {
                    result *= m;
                });
                return result;
            };
            return {
                ...s,
                maxRisk: Math.round(calculateRisk(s.basePoints, s.multipliers)),
                minRisk: Math.round(calculateRisk(s.minBasePoints, s.minMultipliers))
            };
        });
    }, [rules, serviceTypes]);

    return (
        <>
            <div className="d-flex align-items-center mb-3">
                <Title level={3} className="m-0">
                    <FontAwesomeIcon icon={faChartLine} className="me-2 text-primary"/> Мониторинг защиты
                </Title>
            </div>

            <Table
                dataSource={serviceStatsData}
                pagination={false}
                rowKey="id"
                size={"small"}
                className="shadow-sm border-0"
                onRow={(record) => ({
                    onClick: () => {
                        setFilterServiceId(record.id);
                        window.scrollTo({top: 0, behavior: "smooth"});
                    },
                })}
                columns={[
                    {
                        title: "СЕРВИС",
                        dataIndex: "name",
                        key: "name",
                        width: "25%",
                        render: (t, r) => {
                            const hasRules = r.rules?.length > 0;
                            return (
                                <div className="d-flex align-items-center gap-3 py-1">
                                    <div className={`af-status-pulse ${hasRules ? "online" : "offline"}`}/>
                                    <div>
                                        <Text strong className="d-block af-text-sm">{t}</Text>
                                        <Text type="secondary" className="af-text-xs">ID: {r.id}</Text>
                                    </div>
                                </div>
                            );
                        },
                    },
                    {
                        title: "КОНТУР ЗАЩИТЫ",
                        dataIndex: "rules",
                        key: "rules",
                        render: (rules) => {
                            if (!rules?.length) {
                                return <Text type="placeholder" className="af-text-xs">Защита не настроена</Text>;
                            }
                            return (
                                <div className="d-flex flex-wrap gap-1">
                                    {rules.slice(0, 3).map((rule, i) => (
                                        <Tag key={i} bordered={false} className="af-tag-modern">
                                            {typeof rule === "object" ? rule.name : rule}
                                        </Tag>
                                    ))}
                                    {rules.length > 3 && (
                                        <Tag bordered={false}>+{rules.length - 3}</Tag>
                                    )}
                                </div>
                            );
                        },
                    },
                    {
                        title: 'АНАЛИЗ РИСКА (MIN-MAX)',
                        dataIndex: 'maxRisk',
                        key: 'risk_analysis',
                        render: (maxRisk, r) => {
                            const minRisk = r.minRisk;
                            const hasKillSwitch = r.rules?.some((rule) => {
                                return rule.isBlockTransaction;
                            });
                            let statusColor = "#52c41a";
                            let zoneText = "НИЗКИЙ РИСК";

                            if (hasKillSwitch) {
                                statusColor = "#722ed1";
                                zoneText = "БЛОКИРОВКА (Blacklist)";
                            } else if (maxRisk >= 71) {
                                statusColor = "#f5222d";
                                zoneText = "БЛОКИРОВКА (По баллу)";
                            } else if (maxRisk >= 31) {
                                statusColor = "#faad14";
                                zoneText = "ПОДОЗРИТЕЛЬНО";
                            }

                            return (
                                <div className="d-flex flex-column py-1" style={{width: '240px'}}>
                                    <div className="d-flex justify-content-between align-items-end mb-1">
                                        <Text strong className="af-text-risk-status" style={{color: statusColor}}>
                                            {zoneText}
                                        </Text>
                                        <div className="d-flex gap-1">
                                            <Text type="secondary" className="af-text-xs">min: {minRisk}</Text>
                                            <Text type="secondary" className="af-text-xs">→</Text>
                                            <Text strong className="af-text-xs">max: {maxRisk}</Text>
                                        </div>
                                    </div>
                                    <div className="af-progress-wrapper">
                                        <div className="af-progress-inner">
                                            {[...Array(10)].map((_, i) => {
                                                const stepValue = (i + 1) * 10;
                                                const isMinActive = minRisk >= stepValue;
                                                const isMaxActive = maxRisk >= stepValue;
                                                let color = stepValue <= 30 ? "#52c41a" : stepValue <= 70 ? "#faad14" : "#f5222d";

                                                let background = '#e8e8e8';
                                                let border = 'none';

                                                if (isMinActive) {
                                                    background = color;
                                                } else if (isMaxActive) {
                                                    background = `linear-gradient(to bottom, ${color} 20%, transparent 20%, transparent 80%, ${color} 80%)`;
                                                    border = `1px solid ${color}`;
                                                }

                                                return (
                                                    <div key={i} className="af-progress-step"
                                                         style={{background, border}}/>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                    }
                ]}
            />
        </>
    )
}
export default RiskAnalysisDashboard
