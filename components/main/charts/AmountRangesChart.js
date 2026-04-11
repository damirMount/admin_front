import React, {useMemo} from 'react';
import {Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {MoneyFormatNumber} from "../system/MoneyFormatNumber";
import {Typography} from "antd";

const {Text} = Typography;

const RangeTooltip = ({active, payload, label}) => {
    if (active && payload && payload.length) {
        return (
            <div className="card card-body shadow-sm border-0"
                 style={{minWidth: '200px', backgroundColor: 'rgba(255, 255, 255, 0.96)'}}>
                <Text type="secondary" className="mb-2 d-block small">{label}</Text>
                <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small">Сумма:</span>
                    <span className="fw-bold small text-primary">
                        {MoneyFormatNumber(payload[0].value, 'full')}
                    </span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                    <span className="small">Транзакций:</span>
                    <span className="fw-bold small">{payload[0].payload.count}</span>
                </div>
            </div>
        );
    }
    return null;
};

const AmountRangesChart = ({payments, token}) => {
    const data = useMemo(() => {
        if (!payments || payments.length === 0) {
            return [];
        }

        const amounts = payments.map((p) => {
            return Number(p.amount);
        }).sort((a, b) => {
            return a - b;
        });

        const minAmt = amounts[0];
        const maxAmt = amounts[amounts.length - 1];

        const rawStep = (maxAmt - minAmt) / 15;
        let niceStep = 10;

        if (rawStep > 1000) {
            niceStep = Math.ceil(rawStep / 500) * 500;
        } else if (rawStep > 100) {
            niceStep = Math.ceil(rawStep / 100) * 100;
        } else if (rawStep > 50) {
            niceStep = Math.ceil(rawStep / 50) * 50;
        } else {
            niceStep = Math.ceil(rawStep / 10) * 10;
        }

        const startPoint = Math.floor(minAmt / 10) * 10;
        let tempRanges = Array.from({length: 15}, (_, i) => {
            return {
                min: startPoint + i * niceStep,
                max: startPoint + (i + 1) * niceStep,
                totalSum: 0,
                count: 0
            };
        });

        payments.forEach((p) => {
            const amt = Number(p.amount);
            let range = tempRanges.find((r) => {
                return amt >= r.min && amt < r.max;
            });

            if (!range) {
                range = tempRanges[tempRanges.length - 1];
            }

            range.totalSum += amt;
            range.count++;
        });

        let filled = tempRanges.filter((r) => {
            return r.count > 0;
        });

        while (filled.length > 6) {
            let minIdx = 0;
            let minVal = filled[0].totalSum;

            for (let i = 1; i < filled.length; i++) {
                if (filled[i].totalSum < minVal) {
                    minVal = filled[i].totalSum;
                    minIdx = i;
                }
            }

            const canL = minIdx > 0;
            const canR = minIdx < filled.length - 1;
            let mIdx = -1;

            if (canL && canR) {
                if (filled[minIdx - 1].totalSum < filled[minIdx + 1].totalSum) {
                    mIdx = minIdx - 1;
                } else {
                    mIdx = minIdx + 1;
                }
            } else if (canL) {
                mIdx = minIdx - 1;
            } else {
                mIdx = minIdx + 1;
            }

            const target = Math.min(minIdx, mIdx);
            const source = Math.max(minIdx, mIdx);

            filled[target] = {
                min: filled[target].min,
                max: filled[source].max,
                totalSum: filled[target].totalSum + filled[source].totalSum,
                count: filled[target].count + filled[source].count
            };

            filled.splice(source, 1);
        }

        return filled.map((r) => {
            return {
                ...r,
                name: `${MoneyFormatNumber(r.min, 'short')} - ${MoneyFormatNumber(r.max, 'short')}`
            };
        });
    }, [payments]);

    return (
        <div style={{height: 150, width: '100%'}}>
            <ResponsiveContainer>
                <BarChart data={data} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0"/>
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{fontSize: 11}}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{fontSize: 11}}
                        tickFormatter={(v) => {
                            return MoneyFormatNumber(v, 'short');
                        }}
                    />
                    <Tooltip content={<RangeTooltip/>}/>
                    <Bar dataKey="totalSum" radius={[4, 4, 0, 0]} barSize={40}>
                        {data.map((e, i) => {
                            return (
                                <Cell key={i} fill={token.colorInfo} fillOpacity={0.8}/>
                            );
                        })}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AmountRangesChart;