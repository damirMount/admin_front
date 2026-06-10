import React from "react";
import {Card, Col, InputNumber, Row, Select, Space, Switch, Tag, Typography} from "antd";

const {Text} = Typography;

const modeLabels = {
    block: '🔴 Мониторинг и блокировка',
    monitor: '🟡 Только мониторинг'
};

export default function AntiFraudControlPanel({
                                                  canOperate,
                                                  loading,
                                                  isSystemActive,
                                                  systemMode,
                                                  checkCoverage,
                                                  onSettingsChange
                                              }) {
    // --- СТРОГАЯ НОРМАЛИЗАЦИЯ ТИПОВ ДЛЯ ANT DESIGN ---
    // Превращаем 1, "1", true в чистый boolean для Switch
    const active = isSystemActive === true || isSystemActive === 1 || isSystemActive === '1';

    // Гарантируем строку для Select
    const mode = systemMode ? String(systemMode) : 'block';

    // Превращаем строку или null в чистый number для InputNumber
    const coverage = checkCoverage !== undefined && checkCoverage !== null ? Number(checkCoverage) : null;

    return (
        <Card className="shadow-sm border-0 mb-4" bodyStyle={{padding: '16px 24px', backgroundColor: '#ffffff'}}>
            <Row gutter={[24, 16]} align="middle">
                {/* 1. Статус системы */}
                <Col xs={24} md={6}>
                    <Space direction="vertical" size={2}>
                        <Text type="secondary">Статус системы</Text>
                        <Space size="middle">
                            {canOperate ? (
                                <Switch
                                    checked={active}
                                    disabled={loading}
                                    onChange={(val) => onSettingsChange('status', val)}
                                />
                            ) : (
                                <Tag color={active ? "success" : "error"} className="m-0">
                                    {active ? "АКТИВНА" : "ОТКЛЮЧЕНА"}
                                </Tag>
                            )}
                            {canOperate && <Text strong>{active ? 'Включен' : 'Выключен'}</Text>}
                        </Space>
                    </Space>
                </Col>

                {/* 2. Режим работы */}
                <Col xs={24} md={8}>
                    <Space direction="vertical" size={2} style={{width: '100%'}}>
                        <Text type="secondary">Режим работы</Text>
                        {canOperate ? (
                            <Select
                                value={mode}
                                onChange={(val) => onSettingsChange('mode', val)}
                                disabled={!active || loading}
                                style={{width: '100%'}}
                                options={[
                                    {value: 'block', label: '🔴 Мониторинг и блокировка'},
                                    {value: 'monitor', label: '🟡 Только мониторинг'},
                                ]}
                            />
                        ) : (
                            <Text strong className="fs-6">
                                {active ? (modeLabels[mode] || mode) : '—'}
                            </Text>
                        )}
                    </Space>
                </Col>

                {/* 3. Радиус проверки */}
                <Col xs={24} md={10}>
                    <Space direction="vertical" size={2} style={{width: '100%'}}>
                        <Text type="secondary">Покрытие проверки трафика</Text>
                        <Space align="baseline">
                            {canOperate ? (
                                <InputNumber
                                    min={1}
                                    max={100}
                                    value={coverage}
                                    onChange={(val) => onSettingsChange('coverage', val)}
                                    disabled={!active || loading}
                                    formatter={(value) => `${value}%`}
                                    parser={(value) => value.replace('%', '')}
                                />
                            ) : (
                                <Text strong className="text-primary fs-5">
                                    {active ? `${coverage}%` : '—'}
                                </Text>
                            )}
                            <Text type="secondary">всех поступающих платежей</Text>
                        </Space>
                    </Space>
                </Col>
            </Row>
        </Card>
    );
}
