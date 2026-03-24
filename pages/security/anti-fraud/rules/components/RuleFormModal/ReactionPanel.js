import React from 'react';
import {Form, InputNumber, Select, Slider, Space, Typography} from 'antd';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBolt, faCircleInfo, faTriangleExclamation} from "@fortawesome/free-solid-svg-icons";
import {ACTION_MAP} from "../../utils/constants";

const {Text} = Typography;

// Вспомогательный стиль для коробок с подсказками
const hintBoxStyle = (bg, border, color) => {
    return {
        padding: '8px 12px',
        borderRadius: '6px',
        marginTop: '8px',
        fontSize: '12px',
        lineHeight: '1.4',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: bg,
        border: `1px solid ${border}`,
        color: color
    };
};

// Функция генерации хинта на основе текущих значений
const getRiskHint = (actionType, riskValue) => {
    if (actionType === 'block') {
        return {
            status: 'error',
            color: '#ff4d4f',
            text: (
                <div style={hintBoxStyle('#fff2f0', '#ffccc7', '#a8071a')}>
                    <FontAwesomeIcon icon={faTriangleExclamation}/>
                    <span>Режим блокировки: транзакция будет <b>отклонена</b>.</span>
                </div>
            )
        };
    }

    if (actionType !== 'multiply') {
        return {
            status: '',
            text: null,
            color: '#1677ff'
        };
    }

    if (riskValue === 0) {
        return {
            status: 'error',
            color: '#ff4d4f',
            text: (
                <div style={hintBoxStyle('#fff2f0', '#ffccc7', '#a8071a')}>
                    <FontAwesomeIcon icon={faTriangleExclamation}/>
                    <span>Риск станет <b>равен 0</b>. Расчет баллов будет <b>аннулирован</b>.</span>
                </div>
            )
        };
    }

    if (riskValue > 0 && riskValue < 1) {
        return {
            status: 'warning',
            color: '#faad14',
            text: (
                <div style={hintBoxStyle('#fffbe6', '#ffe58f', '#874d00')}>
                    <FontAwesomeIcon icon={faCircleInfo}/>
                    <span>Понижение: риск будет <b>снижен на {Math.round((1 - riskValue) * 100)}%</b>.</span>
                </div>
            )
        };
    }

    if (riskValue === 1) {
        return {
            status: 'success',
            color: '#52c41a',
            text: (
                <div style={hintBoxStyle('#f6ffed', '#b7eb8f', '#135200')}>
                    <FontAwesomeIcon icon={faBolt}/>
                    <span>Множитель <b>x1.0</b> не изменяет сумму баллов.</span>
                </div>
            )
        };
    }

    return {
        status: 'validating',
        color: '#1677ff',
        text: (
            <div style={hintBoxStyle('#e6f4ff', '#91caff', '#003eb3')}>
                <FontAwesomeIcon icon={faBolt}/>
                <span>Усилитель: баллы будут <b>увеличены в {riskValue} раза</b>.</span>
            </div>
        )
    };
};

const ReactionPanel = () => {
    // Подписываемся на значения полей формы напрямую
    const actionType = Form.useWatch('action_type');
    const riskValue = Form.useWatch('risk_value');

    // Получаем актуальный хинт на каждой перерисовке при изменении полей
    const hint = getRiskHint(actionType, riskValue || 0);

    const renderRiskControl = () => {
        if (actionType === 'multiply') {
            return (
                <>
                    <Text className="rf-field-label">
                        Коэффициент риска
                    </Text>
                    <div
                        className="rf-slider-group-container border rounded bg-white"
                    >
                        <Form.Item name="risk_value" className="mb-0" noStyle>
                            <Slider
                                marks={{0: 'x0', 1: 'x1', 2: 'x2', 3: 'x3', 4: 'x4', 5: 'x5'}}
                                min={0}
                                max={5.0}
                                step={0.05}
                                styles={{
                                    track: {background: hint.color},
                                    handle: {borderColor: hint.color, backgroundColor: '#fff'}
                                }}
                                style={{flex: 1, margin: '0 12px'}}
                            />
                        </Form.Item>
                        <Form.Item name="risk_value" className="mb-0" noStyle>
                            <InputNumber
                                min={0}
                                max={5}
                                step={0.1}
                                variant="borderless"
                                prefix={<span style={{color: '#bfbfbf', fontSize: '12px'}}>x</span>}
                                className="rf-slider-input-number"
                            />
                        </Form.Item>
                    </div>
                </>
            );
        }

        if (actionType === 'block') {
            return (
                <>
                    <Text className="rf-field-label">
                        Код ошибки
                    </Text>
                    <Form.Item name="error_code" className="mb-0">
                        <InputNumber
                            placeholder={'-666'}
                            className="w-100"
                        />
                    </Form.Item>
                </>
            );
        }

        return (
            <>
                <Text className="rf-field-label">
                    Баллы риска
                </Text>
                <Form.Item name="risk_value" className="mb-0">
                    <InputNumber
                        min={0}
                        addonBefore="+"
                        addonAfter="балл"
                        className="w-100"
                    />
                </Form.Item>
            </>
        );
    };

    return (
        <div className="rf-reaction-box">
            <Space className="mb-3" style={{color: '#389e0d'}}>
                <FontAwesomeIcon icon={faBolt}/>
                <Text strong className="rf-section-title">Результат</Text>
            </Space>

            <div className="d-flex gap-3 align-items-start">
                <div className="flex-grow-1">
                    <Text className="rf-field-label">Выполнить действие</Text>
                    <Form.Item
                        name="action_type"
                        className="mb-0"
                        validateStatus={hint.status}
                        help={hint.text}
                    >
                        <Select
                            options={Object.entries(ACTION_MAP).map(([k, v]) => {
                                return {
                                    label: v,
                                    value: k
                                };
                            })}
                        />
                    </Form.Item>
                </div>

                <div style={{width: '355px'}}>
                    {renderRiskControl()}
                </div>
            </div>
        </div>
    );
};

export default ReactionPanel;
