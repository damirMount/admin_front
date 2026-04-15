import React, {useEffect, useMemo, useState} from 'react';
import {Button, Card, Empty, Input, Popover, Space, Tag, Typography} from 'antd';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import * as Icons from "@fortawesome/free-solid-svg-icons";
import TransactionPreview from './TransactionPreview';
import CodeBlock from "../../../../../../components/main/DataDisplay/CodeBlock/CodeBlock";
import {ALL_OPERATORS, SUBJECTS} from "../../../../../../components/pages/security/anti-fraud/constants";

const {
    Text
} = Typography;

// --- Вспомогательные функции парсинга (Mapping) ---

const getSubjectLabel = (key) => {
    return SUBJECTS[key]?.label || key;
};

const getFieldLabel = (subKey, fieldKey) => {
    const field = SUBJECTS[subKey]?.fields.find(
        (f) => {
            return f.value === fieldKey;
        }
    );
    return field ? field.label : fieldKey;
};

const getOperatorLabel = (opKey) => {
    const op = ALL_OPERATORS.find(
        (o) => {
            return o.value === opKey;
        }
    );
    return op ? op.label.split('(')[0].trim() : opKey;
};

const formatValue = (val) => {
    if (!isNaN(val) && val !== null && val !== '' && typeof val !== 'object') {
        return Number(val).toLocaleString('ru-RU');
    }
    return val || '—';
};

const styles = {
    container: {
        background: 'linear-gradient(90deg, #fafafa 0%, #ffffff 100%)',
        borderRadius: '8px',
        border: '1px solid #e8e8e8',
        // borderLeft: '4px solid #1890ff',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        marginBottom: '12px'
    },
    column: {
        padding: '0 20px',
        borderInlineStart: '1px solid #f0f0f0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    firstColumn: {
        paddingRight: '20px',
        display: 'flex',
        flexDirection: 'column',
        flex: '0 0 140px'
    },
    label: {
        fontSize: '10px',
        fontWeight: 700,
        color: '#bfbfbf',
        textTransform: 'uppercase',
        marginBottom: '4px',
        letterSpacing: '0.02em'
    },
    value: {
        fontSize: '13px',
        color: '#262626',
        fontWeight: 500
    },
    operatorBadge: {
        background: '#fff1f0',
        color: '#ff4d4f',
        border: 'none',
        fontWeight: 800,
        fontSize: '10px',
        padding: '2px 8px',
        borderRadius: '4px'
    },
    factBox: {
        background: '#fffbe6',
        border: '1px solid #ffe58f',
        borderRadius: '6px',
        padding: '6px 12px',
        minWidth: '120px',
        display: 'flex',
        alignItems: 'center'
    }
};

const ConditionRow = ({
                          condition: c
                      }) => {
    const getSubjectIcon = (s) => {
        return Icons.faDatabase;
    }

    return (
        <div style={styles.container}>
            <div style={styles.firstColumn}>
                <Text style={styles.label}>Объект</Text>
                <Space size={8}>
                    <FontAwesomeIcon
                        icon={getSubjectIcon(c.subject)}
                        style={{
                            color: '#bfbfbf',
                            fontSize: '12px'
                        }}
                    />
                    <Text style={styles.value}>{getSubjectLabel(c.subject)}</Text>
                </Space>
            </div>

            <div style={{
                ...styles.column,
                flex: '1'
            }}>
                <Text style={styles.label}>Параметр</Text>
                <Text style={{
                    ...styles.value,
                    fontWeight: 700
                }}>
                    {getFieldLabel(c.subject, c.field)}
                </Text>
            </div>

            <div style={{
                ...styles.column,
                flex: '0 0 120px',
                alignItems: 'center'
            }}>
                <Text style={styles.label}>Условие</Text>
                <Tag style={styles.operatorBadge}>
                    {getOperatorLabel(c.operator).toUpperCase()}
                </Tag>
            </div>

            <div style={{
                ...styles.column,
                flex: '1'
            }}>
                <Text style={styles.label}>Порог правила</Text>
                <Space>
                    <Text type="secondary" style={{
                        fontSize: '10px'
                    }}>
                        {c.value_type === 'field' ? 'ПОЛЕ' : 'КОНСТАНТА'}
                    </Text>
                    <Text strong style={{
                        fontSize: '13px',
                        color: '#1890ff'
                    }}>
                        {c.value_type === 'field' ? getFieldLabel(c.target_subject, c.value) : formatValue(c.value)}
                    </Text>
                </Space>
            </div>

            <div style={{
                ...styles.column,
                borderInlineStart: '1px solid #f0f0f0'
            }}>
                <Text style={styles.label}>Факт (сейчас)</Text>
                <div style={styles.factBox}>
                    <Text strong>
                        {formatValue(c.current_value)}
                    </Text>
                </div>
            </div>
        </div>
    );
};

const RuleItem = ({
                      rule,
                      forceOpen,
                      dealersList,
                      apparatsList
                  }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setIsVisible(forceOpen);
    }, [forceOpen]);

    const details = rule.details || {};
    const params = details.params || {};
    const evidencePayments = useMemo(() => {
        return Array.isArray(details.evidence_payments) ? details.evidence_payments : [];
    }, [details.evidence_payments]);

    const currentValue = useMemo(() => {
        // Безопасное извлечение оператора из условий или параметров
        const conditions = params.conditions;
        const firstOp = Array.isArray(conditions) && conditions.length > 0 ?
            conditions[0].operator :
            params.agg_func;

        // Регулярное выражение или интуитивный поиск "sum" в операторе
        const isSum = typeof firstOp === 'string' && firstOp.toLowerCase().includes('sum');

        if (isSum) {
            return evidencePayments.reduce((acc, p) => {
                return acc + parseFloat(p.total || 0);
            }, 0);
        }
        return evidencePayments.length;
    }, [params, evidencePayments]);

    const conditions = useMemo(() => {
        if (Array.isArray(params.conditions)) {
            return params.conditions;
        }
        if (params.group_by) {
            return [{
                subject: 'payment',
                field: params.group_by,
                operator: params.agg_func || 'count',
                value: params.value,
                value_type: 'constant'
            }];
        }
        return [];
    }, [params]);

    const filteredPayments = useMemo(() => {
        return evidencePayments.filter((p) => {
            const search = searchTerm.toLowerCase();
            return String(p.id).includes(search) || String(p.identifier || '').toLowerCase().includes(search);
        });
    }, [evidencePayments, searchTerm]);

    const actionType = rule.action || params?.action_type || 'add';
    const riskValue = rule.score || params?.risk_value || 0;
    const isBlock = actionType === 'block';

    return (
        <Card
            size="small"
            className={`af-rule-card ${isVisible ? 'shadow-md' : 'shadow-sm'}`}
            style={{
                borderLeft: `4px solid ${isBlock ? '#ff4d4f' : '#1890ff'}`

            }}
        >
            <div
                className="d-flex justify-content-between align-items-center cursor-pointer"
                onClick={() => {
                    setIsVisible(!isVisible);
                }}
            >
                <Space size={14}>
                    <div
                        className="rule-icon-box"
                        style={{
                            background: isBlock ? '#fff1f0' : '#e6f7ff',
                            color: isBlock ? '#ff4d4f' : '#1890ff',
                            border: `2px solid ${isBlock ? '#ffa39e' : '#91d5ff'}`
                        }}
                    >
                        <FontAwesomeIcon icon={isBlock ? Icons.faCircleXmark : Icons.faShieldHalved} size="lg"/>
                    </div>
                    <div>
                        <Text strong className="af-title-text" style={{
                            color: isBlock ? '#cf1322' : 'inherit'
                        }}>
                            {rule.name}
                        </Text>
                        <div className="d-flex align-items-center mt-1" style={{
                            gap: '12px'
                        }}>
                            <code className="px-1 rounded">ID: {rule.id_rule}</code>
                            {isBlock && <Tag color="error" style={{
                                fontSize: '10px'
                            }}>CRITICAL</Tag>}
                            <code className="px-1 rounded">{details.at}</code>
                        </div>
                    </div>
                </Space>

                <Space size={16}>
                    <div className="text-end ms-3">
                        <Text type="secondary" className='me-2' style={styles.labelSmall}>Вердикт</Text>
                        <Tag color={isBlock ? 'error' : 'processing'}>
                            {isBlock ? 'СТОП' : actionType === 'multiply' ? `x${riskValue}` : `+${riskValue}`}
                        </Tag>
                    </div>
                    <Button
                        type="text"
                        shape="circle"
                        icon={<FontAwesomeIcon icon={isVisible ? Icons.faChevronUp : Icons.faChevronDown}/>}
                    />
                </Space>
            </div>


            {isVisible && (
                <div className="mt-3 pt-3 border-top">
                    <div className="mb-4 d-flex flex-column">
                        <Text type="secondary" style={styles.labelSmall}>
                            Описание:
                        </Text>

                        {(rule.description !== undefined && rule.description !== '') ?
                            <Text className=' fst-italic'> {rule.description}</Text>
                            :
                            <Text className='af-text-sm fst-italic'> Описание отсутствует</Text>
                        }
                    </div>
                    <div className="mb-4">
                        <Text type="secondary" style={styles.labelSmall}>
                            Детализация условий:
                        </Text>
                        <div className="mt-2">
                            {conditions && conditions.length > 0 ? (
                                conditions.map((cond, idx) => {
                                    return (
                                        <ConditionRow
                                            key={idx}
                                            condition={{
                                                ...cond,
                                                current_value: currentValue
                                            }}
                                        />
                                    );
                                })
                            ) : (
                                <div
                                    style={{
                                        padding: '20px 0',
                                        textAlign: 'center',
                                        background: '#fafafa',
                                        borderRadius: '8px',
                                        border: '1px dashed #d9d9d9'
                                    }}
                                >
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description={
                                            <Text type="secondary" style={{fontSize: '13px'}}>
                                                Для данного правила не настроены особые условия срабатывания,
                                                данное правило активно всегда
                                            </Text>
                                        }
                                    />
                                </div>
                            )}
                        </div>
                    </div>


                    {evidencePayments.length > 0 && (
                        <div className="mt-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <Text strong style={{
                                    fontSize: '13px'
                                }}>Связанные события ({evidencePayments.length})</Text>
                                <Input
                                    size="small"
                                    placeholder="Поиск по ID..."
                                    style={{
                                        width: '160px'
                                    }}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                    }}
                                    prefix={<FontAwesomeIcon icon={Icons.faMagnifyingGlass} style={{
                                        opacity: 0.3
                                    }}/>}
                                />
                            </div>
                            <div className="d-flex flex-wrap gap-2">
                                {filteredPayments.map((p) => {
                                    return (
                                        <Popover
                                            key={p.id}
                                            content={<TransactionPreview payment={p} dealersList={dealersList}
                                                                         apparatsList={apparatsList}/>}
                                        >
                                            <div className="af-payment-chip">#{p.id}</div>
                                        </Popover>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="mt-4">
                        <CodeBlock code={{
                            details: rule.details
                        }} title="JSON данные" defaultVisible={false}/>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default RuleItem;
