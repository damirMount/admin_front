import React, {useMemo} from 'react';
import {Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import dayjs from "dayjs";

const HourlyActivityChart = ({payments, token}) => {
    const data = useMemo(() => {
        const hours = Array.from({length: 24}, (_, i) => ({hour: `${i}:00`, count: 0}));
        payments.forEach(p => hours[dayjs(p.createdAt).hour()].count++);

        return hours;
    }, [payments]);

    return (
        <div style={{height: 120, width: '100%'}}>
            <ResponsiveContainer>
                <AreaChart data={data} margin={{top: 10, right: 20, left: -25, bottom: 0}}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0"/>
                    <XAxis dataKey="hour" axisLine={false} interval={1} tickLine={false} tick={{fontSize: 10}}/>
                    <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{fontSize: 10}}/>
                    <Tooltip labelFormatter={v => `Время: ${v}`}/>
                    <Area type="monotone" dataKey="count" name="Транзакции" stroke={token.colorPrimary}
                          fill={token.colorPrimary} fillOpacity={0.1} strokeWidth={2}/>
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default HourlyActivityChart;
