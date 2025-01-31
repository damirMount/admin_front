import React, {useEffect, useState} from 'react';
import {Skeleton} from "antd";

const ChartArea = ({config, className, style, loading}) => {
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
