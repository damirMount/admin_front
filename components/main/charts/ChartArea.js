import React, { useState, useEffect } from 'react';

const ChartArea = ({config}) => {
    const [areaComponent, setAreaComponent] = useState(null);

    useEffect(() => {
        const fetchComponent = async () => {
            // Ленивая загрузка компонента Area
            const { Area } = await import('@ant-design/charts');
            setAreaComponent(<Area {...config} />);
        };

        fetchComponent();
    }, []); 

    // const config = {
    //     data: {
    //         type: 'fetch',
    //         value: 'https://assets.antv.antgroup.com/g2/stocks.json',
    //         transform: [{ type: 'filter', callback: (d) => d.symbol === 'GOOG' }],
    //     },
    //
    //     xField: 'date',
    //     yField: 'price',
    //     style: {
    //         fill: 'linear-gradient(-90deg, white 0%, darkblue 100%)',
    //     },
    //     axis: {
    //         y: { labelFormatter: '~s' },
    //     },
    //     line: {
    //         style: {
    //             stroke: 'darkblue',
    //             strokeWidth: 2,
    //         },
    //     },
    //     // interactions: [{ type: 'brush' }],
    // };

    return areaComponent;
};

export default ChartArea;
