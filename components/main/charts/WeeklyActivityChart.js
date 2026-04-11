import React, {useMemo} from 'react';
import {Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import dayjs from "dayjs";

const WeeklyActivityChart = ({payments, token}) => {
    const data = useMemo(() => {
        const week = [
            {day: 'Пн', count: 0, idx: 1},
            {day: 'Вт', count: 0, idx: 2},
            {day: 'Ср', count: 0, idx: 3},
            {day: 'Чт', count: 0, idx: 4},
            {day: 'Пт', count: 0, idx: 5},
            {day: 'Сб', count: 0, idx: 6},
            {day: 'Вс', count: 0, idx: 0}
        ];

        payments.forEach(p => {
            const d = week.find(w => w.idx === dayjs(p.createdAt).day());
            if (d) d.count++;
        });

        return week.sort((a, b) => (a.idx === 0 ? 7 : a.idx) - (b.idx === 0 ? 7 : b.idx));
    }, [payments]);

    return (
        <div style={{height: 120, width: '100%'}}>
            <ResponsiveContainer>
                <BarChart data={data} margin={{top: 10, right: 5, left: -35, bottom: 0}}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0"/>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10}}/>
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9}} allowDecimals={false}/>
                    <Tooltip labelFormatter={v => `День: ${v}`}/>
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={12}>
                        {data.map((e, i) => (
                            <Cell key={i} fill={['Сб', 'Вс'].includes(e.day) ? '#ff4d4f' : token.colorPrimary}
                                  fillOpacity={0.8}/>
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default WeeklyActivityChart;