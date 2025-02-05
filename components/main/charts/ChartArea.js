import React, {useEffect, useState} from 'react';
import {Button, Empty, Result, Skeleton} from "antd";

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
            <Result
                icon={<Empty description={false}/>}
                title="ДАННЫЕ ОТСУТВУЮТ"
                subTitle="Извините, но мы не смогли ничего найти по вашему запросу."
                extra={onCallBack ? (
                    <Button type="primary" onClick={onCallBack}>Попробовать ещё раз</Button>
                ) : ''}
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
