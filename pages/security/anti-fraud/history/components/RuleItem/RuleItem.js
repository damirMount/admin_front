import React, {useEffect, useMemo, useState} from 'react';
import {Button, Card, Empty, Input, Popover, Row, Space, Tag, Typography} from 'antd';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import * as Icons from "@fortawesome/free-solid-svg-icons";

import MetricItem from './MetricItem';
import TransactionPreview from './TransactionPreview';
import {MoneyFormatNumber} from "../../../../../../components/main/system/MoneyFormatNumber";
import CodeBlock from "../../../../../../components/main/DataDisplay/CodeBlock/CodeBlock";

const {Text} = Typography;

const RuleItem = ({rule, forceOpen, dealersList, apparatsList}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const getReasonPhrase = (ruleName, condition, currentValue) => {
        if (!condition) {
            return `Правило "${ruleName}" сработало по системному событию без дополнительных условий.`;
        }

        const fields = {
            'identifier': 'номеру (реквизиту)',
            'id_apparat': 'терминалу',
            'card_hash': 'банковской карте',
            'account': 'счёту',
            'id_dealer': 'дилеру'
        };

        const target = fields[condition.group_by] || `полю ${condition.group_by}`;
        const time = condition.window;
        const limit = condition.value;
        const isSum = condition.agg_func === 'sum';

        const formatVal = (v) => {
            return isSum ? `${MoneyFormatNumber(v, 'short')} сом` : `${v} транз.`;
        };

        if (currentValue >= limit) {
            return (
                <span>
                    Критическое превышение: зафиксирована {isSum ? 'сумма' : 'активность'}
                    <b className="text-danger"> {formatVal(currentValue)}</b> (порог {formatVal(limit)})
                    по {target} за последние <b>{time} мин.</b>
                </span>
            );
        }

        return `Условие: не более ${formatVal(limit)} по ${target} в окне ${time} мин.`;
    };

    useEffect(() => {
        setIsVisible(forceOpen);
    }, [forceOpen]);

    // Данные из новой структуры (объект details уже распарсен бэкендом или SafeParse)
    const details = rule.details || {};
    const params = details.params || {};
    const condition = params?.conditions?.[0];

    const evidencePayments = useMemo(() => {
        return Array.isArray(details.evidence_payments) ? details.evidence_payments : [];
    }, [details.evidence_payments]);

    const filteredPayments = useMemo(() => {
        return evidencePayments.filter((p) => {
            const search = searchTerm.toLowerCase();
            return String(p.id).includes(search) ||
                String(p.identifier || '').toLowerCase().includes(search);
        });
    }, [evidencePayments, searchTerm]);

    // Параметры вердикта
    const actionType = rule.action || params?.action_type || 'add';
    const riskValue = rule.score || params?.risk_value || 0;
    const isBlock = actionType === 'block';

    // Расчет текущего значения метрики на основе совпавших платежей
    const currentValue = useMemo(() => {
        if (!condition) return 0;
        if (condition.agg_func === 'sum') {
            return evidencePayments.reduce((acc, p) => acc + parseFloat(p.total || 0), 0);
        }
        return evidencePayments.length;
    }, [condition, evidencePayments]);

    const threshold = condition?.value || 0;
    const isAlwaysOn = !condition || (threshold === 0 && currentValue === 0);
    const isOverLimit = !isAlwaysOn && currentValue >= threshold;

    const renderActionLabel = () => {
        if (isBlock) return `БЛОКИРОВКА ПЛАТЕЖА`;
        return actionType === 'multiply' ? `МНОЖИТЕЛЬ ×${riskValue}` : `БАЛЛЫ +${riskValue}`;
    };

    const formatMetric = (v) => {
        if (isAlwaysOn) return 'ВСЕГДА ВКЛ';
        return condition?.agg_func === 'sum' ? MoneyFormatNumber(v, 'short') : v;
    };

    return (
        <Card
            size="small"
            className={`af-rule-card ${isVisible ? 'shadow-md' : 'shadow-sm'}`}
            style={{borderLeft: `4px solid ${isBlock ? '#ff4d4f' : '#1890ff'}`}}
        >
            <div
                className="d-flex justify-content-between align-items-center cursor-pointer"
                onClick={() => setIsVisible(!isVisible)}
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
                        <Text strong className="af-title-text" style={{color: isBlock ? '#cf1322' : 'inherit'}}>
                            {rule.name}
                        </Text>
                        <div className="d-flex align-items-center mt-1" style={{gap: '12px'}}>
                            <code className="px-1 rounded">ID: {rule.id_rule}</code>
                            {isBlock && (
                                <Tag color="error" style={{margin: 0, fontSize: '10px', borderRadius: '4px'}}>
                                    CRITICAL
                                </Tag>
                            )}
                            <code className="px-1 rounded">{rule.details.at}</code>
                        </div>
                    </div>
                </Space>
                <Space size={16}>
                    <div className="text-end ms-3">
                        <Text type="secondary" className="af-label-uppercase">Вердикт</Text>
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
                    {/* Блок вердикта и причины */}
                    <div className="mb-4">
                        <div className={`af-reason-badge ${isBlock ? 'is-danger' : 'is-info'}`}>
                            <FontAwesomeIcon
                                icon={isBlock ? Icons.faTriangleExclamation : Icons.faCircleInfo}
                            />
                            <div>
                                {isBlock && (
                                    <Text strong className="d-block text-danger mb-1" style={{fontSize: '11px'}}>
                                        ПРИЧИНА БЛОКИРОВКИ:
                                    </Text>
                                )}
                                <Text>
                                    {getReasonPhrase(rule.name, condition, currentValue)}
                                </Text>
                            </div>
                        </div>
                    </div>

                    {/* Сетка метрик */}
                    <Row gutter={[12, 12]} className="mb-4">
                        <MetricItem
                            label="Текущее значение"
                            val={formatMetric(currentValue)}
                            subVal={!isAlwaysOn && threshold > 0 ? `порог ${formatMetric(threshold)}` : null}
                            color={isOverLimit ? '#ff4d4f' : '#1890ff'}
                            icon={Icons.faArrowTrendUp}
                            isOverLimit={isOverLimit}
                            bg={'#f8fbf1'}
                        />
                        <MetricItem
                            label="Тип действия"
                            val={renderActionLabel()}
                            color={isBlock ? '#cf1322' : '#722ed1'}
                            icon={isBlock ? Icons.faBan : Icons.faGears}
                            bg={isBlock ? '#fff1f0' : '#f8fbf1'}
                        />
                    </Row>

                    {/* Связанные транзакции */}
                    {evidencePayments.length > 0 && (
                        <div className="mt-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <Space direction="vertical" size={0}>
                                    <Text strong style={{fontSize: '13px'}}>
                                        <FontAwesomeIcon
                                            icon={Icons.faLink}
                                            className="me-2"
                                            style={{opacity: 0.5}}
                                        />
                                        Связанные события
                                    </Text>
                                    <Text type="secondary" style={{fontSize: '11px'}}>
                                        Найдено: {evidencePayments.length} шт.
                                    </Text>
                                </Space>

                                <Input
                                    size="small"
                                    placeholder="Фильтр ID..."
                                    style={{width: '160px', borderRadius: '6px'}}
                                    onChange={(e) => {
                                        {
                                            setSearchTerm(e.target.value);
                                        }
                                    }}
                                    prefix={
                                        <FontAwesomeIcon
                                            icon={Icons.faMagnifyingGlass}
                                            style={{fontSize: '10px', color: '#bfbfbf'}}
                                        />
                                    }
                                />
                            </div>

                            <div className="af-evidence-scrollpane">
                                <div className="d-flex flex-wrap gap-2">
                                    {filteredPayments.length > 0 ? (
                                        filteredPayments.map((payment) => {
                                            {
                                                return (
                                                    <Popover
                                                        key={payment.id}
                                                        content={
                                                            <TransactionPreview
                                                                payment={payment}
                                                                dealersList={dealersList}
                                                                apparatsList={apparatsList}
                                                            />
                                                        }
                                                        trigger="hover"
                                                        placement="top"
                                                    >
                                                        <div className="af-payment-chip">
                                                            <span
                                                                style={{color: '#bfbfbf', marginRight: '2px'}}
                                                            >#</span>
                                                            {payment.id}
                                                        </div>
                                                    </Popover>
                                                );
                                            }
                                        })
                                    ) : (
                                        <div style={{width: '100%', padding: '20px 0'}}>
                                            <Empty
                                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                description="Ничего не найдено"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Технический блок */}
                    <div className="mt-4">
                        <CodeBlock
                            code={{details: rule.details}}
                            title="Технические параметры (JSON)"
                            defaultVisible={false}
                        />
                    </div>
                </div>
            )}
        </Card>
    );
};

export default RuleItem;
