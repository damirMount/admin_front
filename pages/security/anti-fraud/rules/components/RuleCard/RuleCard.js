import {ALL_OPERATORS, SUBJECTS} from "../../utils/constants";
import {formatTimeWindow} from "../../utils/helpers";
import {Divider, Space, Tag, Typography} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faClockRotateLeft,
    faDatabase,
    faFilter,
    faGlobe,
    faHashtag,
    faLayerGroup,
    faShieldHalved
} from "@fortawesome/free-solid-svg-icons";
import CodeBlock from "../../../../../../components/main/DataDisplay/CodeBlock/CodeBlock";
import React from "react";

const {Text, Title} = Typography;

const RuleCard = ({record, serviceMap}) => {
    const isActive = record.is_active;
    const params = record.params || {};
    const conditions = params.conditions || [];

    const actionType = params.action_type;
    const riskValue = params.risk_value ?? 0;

    const getSubjectLabel = (key) => {
        return SUBJECTS[key]?.label || key;
    };

    const getFieldLabel = (subKey, fieldKey) => {
        const field = SUBJECTS[subKey]?.fields.find((f) => {
            return f.value === fieldKey;
        });
        return field ? field.label : fieldKey;
    };

    const getOperatorLabel = (opKey) => {
        const op = ALL_OPERATORS.find((o) => {
            return o.value === opKey;
        });
        return op ? op.label.split('(')[0].trim() : opKey;
    };

    const formatValue = (val) => {
        if (!isNaN(val) && val !== null && val !== '') {
            return Number(val).toLocaleString('ru-RU');
        }
        return val || '—';
    };

    const timeRange = params.time_range || [];
    const hasTime = timeRange?.length === 2 && timeRange[0];

    return (
        <div className="p-3 af-expandable-row" style={{background: '#fcfcfc'}}>
            <div className="row g-4">
                {/* Левая колонка: Логика */}
                <div className="col-md-7">
                    <div className="af-info-card bg-white p-4 rounded-3 border shadow-sm d-flex flex-column"
                         style={{minHeight: '100%'}}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <Space size={10}>
                                <div className="bg-primary bg-opacity-10 p-2 rounded-circle"
                                     style={{
                                         width: '32px',
                                         height: '32px',
                                         display: 'flex',
                                         alignItems: 'center',
                                         justifyContent: 'center'
                                     }}>
                                    <FontAwesomeIcon icon={faShieldHalved} className="text-primary"/>
                                </div>
                                <div>
                                    <Text strong style={{
                                        fontSize: '12px',
                                        color: '#262626',
                                        display: 'block',
                                        lineHeight: 1.2
                                    }}>
                                        ЛОГИКА АЛГОРИТМА
                                    </Text>
                                    <Text type="secondary" style={{fontSize: '11px'}}>Правила проверки транзакции</Text>
                                </div>
                            </Space>
                            <Tag color={isActive ? "success" : "default"}
                                 style={{borderRadius: '100px', padding: '0 12px', fontWeight: 600, border: 'none'}}>
                                {isActive ? '● АКТИВНО' : '● ПАУЗА'}
                            </Tag>
                        </div>

                        <div className="flex-grow-1">
                            <div className="d-flex flex-column gap-3 mb-4">
                                {conditions.length > 0 ? (
                                    conditions.map((c, idx) => (
                                        <div
                                            key={idx}
                                            className="d-flex align-items-center p-2 rounded-3"
                                            style={{
                                                background: '#fff',
                                                border: '1px solid #f0f0f0',
                                                borderLeft: '4px solid #1890ff',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                            }}
                                        >
                                            {/* Объект */}
                                            <div style={{width: '85px'}} className="ps-2">
                                                <Text type="secondary" style={{
                                                    fontSize: '10px',
                                                    display: 'block',
                                                    marginBottom: '2px',
                                                    fontWeight: 600
                                                }}>
                                                    ОБЪЕКТ
                                                </Text>
                                                <Space size={6}>
                                                    <FontAwesomeIcon icon={faDatabase}
                                                                     style={{fontSize: '10px', color: '#bfbfbf'}}/>
                                                    <Text strong style={{fontSize: '11px', color: '#595959'}}>
                                                        {getSubjectLabel(c.subject)}
                                                    </Text>
                                                </Space>
                                            </div>

                                            {/* Поле */}
                                            <div className="px-3 border-start" style={{flex: 1.5}}>
                                                <Text type="secondary" style={{
                                                    fontSize: '10px',
                                                    display: 'block',
                                                    marginBottom: '2px',
                                                    fontWeight: 600
                                                }}>
                                                    ПАРАМЕТР
                                                </Text>
                                                <Text strong style={{fontSize: '13px', color: '#262626'}}>
                                                    {getFieldLabel(c.subject, c.field)}
                                                </Text>
                                            </div>

                                            {/* Оператор */}
                                            <div className="px-3 border-start text-center" style={{width: '170px'}}>
                                                <Text type="secondary" style={{
                                                    fontSize: '10px',
                                                    display: 'block',
                                                    marginBottom: '2px',
                                                    fontWeight: 600
                                                }}>
                                                    УСЛОВИЕ
                                                </Text>
                                                <Tag color="error" plain style={{
                                                    margin: 0,
                                                    fontSize: '11px',
                                                    fontWeight: 700,
                                                    border: 'none',
                                                    background: '#fff1f0'
                                                }}>
                                                    {getOperatorLabel(c.operator).toUpperCase()}
                                                </Tag>
                                            </div>

                                            {/* Значение */}
                                            <div className="px-3 border-start text-end" style={{flex: 1.2}}>
                                                <Text type="secondary" style={{
                                                    fontSize: '10px',
                                                    display: 'block',
                                                    marginBottom: '2px',
                                                    fontWeight: 600
                                                }}>
                                                    ЗНАЧЕНИЕ
                                                </Text>
                                                <div className="d-flex flex-column align-items-end">
                                                    <Text strong
                                                          style={{fontSize: '14px', color: '#1890ff', lineHeight: 1.2}}>
                                                        {formatValue(c.value)}
                                                    </Text>
                                                    {c.time_window && (
                                                        <Text type="secondary" style={{fontSize: '10px'}}>
                                                            период: {formatTimeWindow(c.time_window)}
                                                        </Text>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-5 text-center border rounded-3 bg-light"
                                         style={{borderStyle: 'dashed'}}>
                                        <FontAwesomeIcon icon={faFilter} className="text-muted mb-3"
                                                         style={{fontSize: '24px', opacity: 0.2}}/>
                                        <Text type="secondary" className="d-block">Дополнительные фильтры не
                                            применяются</Text>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-3 border-top border-light mt-auto">
                            <div className="row">
                                <div className="col-6">
                                    <Text type="secondary" style={{
                                        fontSize: '10px',
                                        display: 'block',
                                        marginBottom: '4px',
                                        fontWeight: 700
                                    }}>
                                        РЕАКЦИЯ
                                    </Text>
                                    {actionType === 'block' ? (
                                        <Tag color="red" style={{
                                            fontWeight: 700,
                                            padding: '4px 12px',
                                            borderRadius: '6px',
                                            margin: 0
                                        }}>
                                            🛑 БЛОКИРОВКА ПЛАТЕЖА
                                        </Tag>
                                    ) : (
                                        <Tag color={actionType === 'multiply' ? 'purple' : 'orange'}
                                             style={{
                                                 fontWeight: 700,
                                                 padding: '4px 12px',
                                                 borderRadius: '6px',
                                                 margin: 0
                                             }}>
                                            {actionType === 'multiply' ? `✖️ МНОЖИТЕЛЬ x${riskValue}` : `➕ РИСК +${riskValue}`}
                                        </Tag>
                                    )}
                                </div>
                                {hasTime && (
                                    <div className="col-6 border-start">
                                        <Text type="secondary" style={{
                                            fontSize: '10px',
                                            display: 'block',
                                            marginBottom: '4px',
                                            fontWeight: 700
                                        }}>
                                            ОКНО РАБОТЫ
                                        </Text>
                                        <Space size={6}>
                                            <FontAwesomeIcon icon={faClockRotateLeft} className="text-primary"
                                                             style={{fontSize: '12px'}}/>
                                            <Text strong style={{fontSize: '13px', color: '#434343'}}>
                                                Работает с {timeRange[0]} до {timeRange[1]}
                                            </Text>
                                        </Space>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Правая колонка: Область применения */}
                <div className="col-md-5">
                    <div className="af-info-card bg-white p-4 rounded-3 border shadow-sm h-100">
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <FontAwesomeIcon icon={faLayerGroup} className="text-secondary" style={{fontSize: '16px'}}/>
                            <Text strong style={{fontSize: '12px', color: '#262626', letterSpacing: '0.5px'}}>
                                ОБЛАСТЬ ПРИМЕНЕНИЯ
                            </Text>
                        </div>
                        <Divider style={{margin: '0 0 20px 0', opacity: 0.6}}/>

                        {record.service_types_ids?.length > 0 ? (
                            <div className="d-flex flex-wrap gap-2">
                                {record.service_types_ids.map((id) => (
                                    <Tag key={id} bordered={false}
                                         style={{
                                             borderRadius: '6px',
                                             background: '#f0f5ff',
                                             color: '#1d39c4',
                                             fontWeight: 600,
                                             padding: '4px 10px',
                                             margin: 0
                                         }}>
                                        <FontAwesomeIcon icon={faHashtag} className="me-1"
                                                         style={{fontSize: '10px', opacity: 0.5}}/>
                                        {serviceMap[id] || `ID ${id}`}
                                    </Tag>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-5 rounded-3 d-flex flex-column justify-content-center"
                                 style={{background: '#fafafa', border: '1px dashed #d9d9d9'}}>
                                <FontAwesomeIcon icon={faGlobe} className="text-muted mb-3"
                                                 style={{fontSize: '32px', opacity: 0.1}}/>
                                <Text type="secondary" className="d-block"
                                      style={{fontSize: '13px', maxWidth: '200px', margin: '0 auto'}}>
                                    Применяется ко всем сервисам в рамках системы
                                </Text>
                            </div>
                        )}
                    </div>
                </div>

                <div className="col-12 mt-4">
                    <CodeBlock code={record.params} title="ТЕХНИЧЕСКИЙ ОБЪЕКТ ПАРАМЕТРОВ"/>
                </div>
            </div>
        </div>
    );
};

export default RuleCard;
