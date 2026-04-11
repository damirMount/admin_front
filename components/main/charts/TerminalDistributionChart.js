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

        return Object.keys(map).map(k => ({name: k, count: map[k]}));
    }, [payments, apparatsList]);

    return (
        <div style={{height: 150, width: '100%'}}>
            <ResponsiveContainer>
                <BarChart data={data} layout="vertical" margin={{top: 5, right: 30, left: 40, bottom: 5}}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0"/>
                    <XAxis type="number" domain={[0, 'dataMax']} hide/>
                    <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 10}} axisLine={false}
                           tickLine={false}/>
                    <Tooltip formatter={v => [v, "Кол-во транзакций"]}/>
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={14}>
                        {data.map((_, i) => <Cell key={i} fill={token.colorInfo} fillOpacity={0.7}/>)}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TerminalDistributionChart;