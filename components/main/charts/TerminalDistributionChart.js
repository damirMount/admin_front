import React, {useMemo} from 'react';
import {Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {findById} from "../system/FindById";

const TerminalDistributionChart = ({payments, apparatsList, token}) => {
    const data = useMemo(() => {
        const map = {};

        payments.forEach(p => {
            const app = findById(apparatsList, p.apparat_id);
            const name = app?.id ? app.name : `Точка #${p.apparat_id}`;
            map[name] = (map[name] || 0) + 1;
        });

        // Сортируем по убыванию количества транзакций
        return Object.keys(map)
            .map(k => ({name: k, count: map[k]}))
            .sort((a, b) => b.count - a.count);
    }, [payments, apparatsList]);

    // Рассчитываем высоту: минимум 150px, или 35px на каждый элемент
    const chartHeight = Math.max(150, data.length * 30);

    return (
        <div style={{
            height: 150, // Фиксированная высота карточки
            width: '100%',
            overflowY: 'auto', // Включаем прокрутку
            overflowX: 'hidden',
            paddingRight: '10px'
        }}>
            <div style={{height: chartHeight, width: '100%'}}>
                <ResponsiveContainer>
                    <BarChart data={data} layout="vertical" margin={{right: 30, left: 40, bottom: 5}}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0"/>
                        <XAxis type="number" domain={[0, 'dataMax']} hide/>
                        <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 10}} axisLine={false}
                               tickLine={false}/>
                        <Tooltip formatter={v => [v, "Кол-во транзакций"]}/>
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={14}>
                            {data.map((_, i) => <Cell key={i} fill={token.colorInfo} fillOpacity={0.7}/>)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TerminalDistributionChart;
