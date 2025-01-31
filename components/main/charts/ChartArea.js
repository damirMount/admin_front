import React, {useEffect, useState} from 'react';
import {Button, Empty, Skeleton} from "antd";
import { Typography } from 'antd';
const { Text, Title } = Typography;

const ChartArea = ({config, className, style, loading, onCallBack}) => {
    const [AreaComponent, setAreaComponent] = useState(null); // Состояние для компонента
    const [isLoaded, setIsLoaded] = useState(false); // Состояние для отслеживания завершения загрузки

    useEffect(() => {
        const loadComponent = async () => {
            // Динамическая загрузка компонента
            const {Area} = await import('@ant-design/charts');
            setAreaComponent(() => Area); // Устанавливаем компонент после загрузки
            setIsLoaded(true); // Меняем состояние, когда компонент загружен
        };

        loadComponent();
    }, []); // Загружаем компонент только один раз при монтировании

    // Пока компонент не загружен, показываем скелет
    if (loading || !isLoaded) {
        return (
            <Skeleton.Node
                className={loading ? '' : 'd-none'}
                active={loading}
                style={{width: '100%', minHeight: '70.05vh', fontSize: 0}}
            />
        );
    }

    if ((!loading || isLoaded) && (config && config.data.length <= 0)) {
        return (
            <div className="ant-result d-flex flex-column align-items-center justify-content-center"
                 style={{width: '100%', minHeight: '70.05vh'}}>
                <Empty description={false} />
                <Title level={3} className='ant-result-title'>ДАННЫЕ ОТСУТВУЮТ</Title>
                <Text type="secondary">Извините, но мы не смогли ничего найти по вашему запросу.</Text>
                {onCallBack ? (
                    <Button type="primary" className="mt-4" onClick={onCallBack}>Попробовать ещё раз</Button>
                ) : {}}
            </div>
        );
    }

    // После загрузки компонента отображаем его с переданными пропсами и стилями
    return (
        <div
            className={className}
            style={{
                ...style,
                display: 'block', // Показываем компонент после загрузки
            }}
        >
            <AreaComponent {...config} /> {/* Отображаем компонент с конфигурацией */}
        </div>
    );
};

export default ChartArea;
