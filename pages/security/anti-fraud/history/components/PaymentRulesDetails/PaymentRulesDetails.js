import React, {useEffect, useMemo, useState} from 'react';
import {Avatar, Button, Col, Collapse, Divider, Input, message, Row, Space, Tag, Timeline, Typography} from 'antd';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import * as Icons from "@fortawesome/free-solid-svg-icons";
import {faDiscord} from "@fortawesome/free-brands-svg-icons";

import PaymentDescriptionCard
    from "../../../../../../components/main/payments/paymentDescription/PaymentDescriptionCard";
import {ANTIFRAUD_OPERATOR_ACTION_API, GET_ANTIFRAUD_HISTORY_DETAIL_API} from "../../../../../../routes/api";

import FormatDate from "../../../../../../components/main/system/FormatDate";
import './PaymentRulesDetails.css';
import RuleSkeleton from "../RuleItem/RuleSkeleton";
import RuleItem from "../RuleItem/RuleItem";
import ProfileWhitelistCard
    from "../../../../../../components/pages/security/anti-fraud/ProfileWhitelistCard/ProfileWhitelistCard";
import {useAuth} from "../../../../../../contexts/AccessContext";

const {Text, Title} = Typography;
const {Panel} = Collapse;
const {TextArea} = Input;

const getStatusConfig = (action) => {
    switch (action) {
        case 'deny':
            return {
                color: '#ff4d4f',
                text: 'ОТКЛОНЕНО'
            };
        case 'wait':
            return {
                color: '#faad14',
                text: 'РУЧНАЯ ПРОВЕРКА'
            };
        default:
            return {
                color: '#52c41a',
                text: 'ОДОБРЕНО'
            };
    }
};

const IterationWrapper = ({
                              entry,
                              session,
                              expandAll,
                              serversList,
                              servicesList,
                              apparatsList,
                              dealersList,

                          }) => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(
        () => {
            if (expandAll) {
                setIsOpen(true);
            } else {
                setIsOpen(false);
            }
        },
        [expandAll]
    );

    const rules = (Array.isArray(entry.triggered_rules) ? entry.triggered_rules : [])
        .filter(
            (r) => {
                return r.id_rule;
            }
        );

    if (rules.length === 0) {
        return null;
    }

    const status = getStatusConfig(entry.final_action);

    return (
        <div className="af-iteration-external-container">
            <Collapse
                activeKey={isOpen ? [String(entry.iteration)] : []}
                onChange={
                    (keys) => {
                        setIsOpen(keys.length > 0);
                    }
                }
                ghost
                className="af-iteration-collapse-v2"
            >
                <Panel
                    key={String(entry.iteration)}
                    header={
                        <div className="af-iteration-header-v2">
                            <Row justify="space-between" align="middle" style={{width: '100%'}}>
                                <Col>
                                    <Space size={12}>
                                        <div className="af-header-shield-icon">
                                            <FontAwesomeIcon icon={Icons.faShieldHalved}/>
                                        </div>
                                        <Text strong style={{fontSize: '14px'}}>Антифрод проверка</Text>
                                        <Tag color="blue" bordered={false}>{entry.total_score} AF Баллы</Tag>
                                    </Space>
                                </Col>
                                <Col>
                                    <Space>
                                        <Text type="secondary" style={{fontSize: '11px'}}>
                                            {FormatDate(entry.createdAt)}
                                        </Text>
                                        <Tag color={status.color} style={{fontWeight: 'bold', margin: 0}}>
                                            {status.text}
                                        </Tag>
                                    </Space>
                                </Col>
                            </Row>
                        </div>
                    }
                >
                    <div className="af-iteration-content">
                        <Divider plain orientation="left">
                            <Space>
                                <FontAwesomeIcon icon={Icons.faUserShield} style={{color: '#1890ff'}}/>
                                <Text strong>Данные по клиенту на момент проверки</Text>
                            </Space>
                        </Divider>

                        <ProfileWhitelistCard client={entry.runtime_snapshot['profile']} session={session}/>

                        <Divider>Сработавшие правила</Divider>
                        {rules.map(
                            (rule, idx) => {
                                return (
                                    <div key={`${rule.id_rule}-${idx}`} className="af-rule-card-wrapper mb-3">
                                        <RuleItem
                                            rule={rule}
                                            forceOpen={expandAll}
                                            apparatsList={apparatsList}
                                            dealersList={dealersList}
                                        />
                                    </div>
                                );
                            }
                        )}

                        {entry.runtime_snapshot['oper'] && (
                            <div className="mt-4">
                                <Collapse ghost className="af-snapshot-collapse">
                                    <Panel
                                        header={
                                            <div className='d-flex justify-content-between'>
                                                <Space>
                                                    <FontAwesomeIcon
                                                        icon={Icons.faHistory}
                                                        style={{fontSize: '10px', color: '#8c8c8c'}}
                                                    />
                                                    <Text type="secondary" style={{fontSize: '12px'}}>
                                                        Данные платежа на момент проверки (Snapshot)
                                                    </Text>
                                                </Space>
                                                <Space>
                                                    <Text
                                                        type="secondary"
                                                        copyable={{text: String(entry.id)}}
                                                        style={{fontSize: '12px'}}
                                                    >
                                                        ID {entry.id}
                                                    </Text>
                                                </Space>
                                            </div>
                                        }
                                        key="snapshot"
                                    >
                                        <div className="af-snapshot-card-container">
                                            <PaymentDescriptionCard
                                                session={session}
                                                record={entry.runtime_snapshot['oper']}
                                                servicesList={servicesList}
                                                dealersList={dealersList}
                                                apparatsList={apparatsList}
                                                serversList={serversList}
                                                showActions={false}
                                            />
                                        </div>
                                    </Panel>
                                </Collapse>
                            </div>
                        )}
                    </div>
                </Panel>
            </Collapse>
        </div>
    );
};

const PaymentRulesDetails = ({
                                 record,
                                 servicesList,
                                 serversList,
                                 dealersList,
                                 apparatsList,
                                 session
                             }) => {
    const [payment, setPayment] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandAll, setExpandAll] = useState(false);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const {checkAccess} = useAuth();

    const [canOperate, setCanOperate] = useState(false);

    useEffect(() => {
        const verifyAccess = async () => {
            if (session) {
                const hasAccess = await checkAccess('antifraud_operator', false);
                setCanOperate(hasAccess);
            }
        };
        verifyAccess();
    }, [session, checkAccess]);

    const fetchHistory = async () => {
        if (!record.id_payment) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${GET_ANTIFRAUD_HISTORY_DETAIL_API}/${record.id_payment}`, {
                headers: {'Authorization': `Bearer ${session?.accessToken}`}
            });

            if (response.ok) {
                const result = await response.json();
                const rootData = Array.isArray(result) ? result[0] : (result.data?.[0] || result.data);

                if (rootData) {
                    const paymentData = Array.isArray(rootData.payment) ? rootData.payment[0] : null;
                    const historyData = Array.isArray(rootData.history) ? rootData.history : [];

                    setPayment(paymentData);
                    setHistory(historyData);
                }
            }
        } catch (e) {
            console.error("Ошибка при загрузке деталей:", e);
            message.error("Не удалось загрузить данные транзакции");
        } finally {
            setLoading(false);
        }
    };

    useEffect(
        () => {
            fetchHistory();
        },
        [record.id_payment, session]
    );

    const handleAction = async (actionType, recordId) => {
        if (!comment || comment.trim().length < 5) {
            message.warning('Пожалуйста, введите обоснование решения (минимум 5 символов)');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(ANTIFRAUD_OPERATOR_ACTION_API, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    recordId: recordId,
                    paymentId: payment?.id || record.id_payment,
                    action: actionType === 'allow' ? 'approve' : 'reject',
                    comment: comment,
                    operatorId: session?.user?.id || 0,
                    operatorName: session?.user?.name || 'Operator'
                })
            });

            if (response.ok) {
                message.success(`Платеж успешно ${actionType === 'allow' ? 'разрешен' : 'отклонен'}`);
                setComment('');
                await fetchHistory();
            } else {
                const errorData = await response.json();
                message.error(errorData.message || 'Ошибка при сохранении решения');
            }
        } catch (e) {
            console.error(e);
            message.error('Сетевая ошибка при отправке решения');
        } finally {
            setSubmitting(false);
        }
    };

    const timelineItems = useMemo(
        () => {
            const items = [];

            if (payment) {
                items.push(
                    {
                        dot: <FontAwesomeIcon icon={Icons.faCirclePlay} style={{fontSize: '16px', color: '#bfbfbf'}}/>,
                        children: (
                            <div
                                className="af-compact-node mt-2 d-flex justify-content-between"
                                style={{marginLeft: '10px'}}
                            >
                                <div>
                                    <Text type="secondary">Платёж поступил: </Text>
                                    <Text strong> {FormatDate(payment.time)}</Text>
                                </div>
                                <Button size="small" onClick={() => {
                                    setExpandAll(!expandAll);
                                }}>
                                    {expandAll ? 'Свернуть всё' : 'Развернуть всё'}
                                </Button>
                            </div>
                        )
                    }
                );
            }

            history.forEach(
                (entry, entryIdx) => {
                    const isWait = entry.final_action === 'wait' || payment.payments_run === 3;
                    const isDeny = ['approve', 'reject', 'deny'].includes(entry.final_action);
                    const isLastEntry = entryIdx === history.length - 1;

                    // 1. Отрисовка основной карточки итерации
                    items.push(
                        {
                            children: (
                                <IterationWrapper
                                    key={`iter-${entry.id}`}
                                    entry={entry}
                                    session={session}
                                    expandAll={expandAll}
                                    apparatsList={apparatsList}
                                    dealersList={dealersList}
                                    servicesList={servicesList}
                                    serversList={serversList}
                                />
                            )
                        }
                    );

                    // 2. Системный вердикт
                    items.push(
                        {
                            className: (entry.operator_actions?.length > 0 || (isWait && isLastEntry)) ? "af-dashed-line" : "",
                            dot: (
                                <Avatar
                                    size={26}
                                    style={{backgroundColor: isDeny ? '#ff4d4f' : (isWait ? '#faad14' : '#52c41a')}}
                                    icon={
                                        <FontAwesomeIcon
                                            icon={isDeny ? Icons.faBan : (isWait ? Icons.faHourglassHalf : Icons.faCircleCheck)}
                                            style={{fontSize: '14px', color: '#ffffff'}}
                                        />
                                    }
                                />
                            ),
                            children: (
                                <div style={{marginLeft: '10px', marginBottom: '20px', marginTop: '-10px'}}>
                                    <Space direction="vertical" size={0}>
                                        <Text
                                            strong
                                            style={{
                                                fontSize: '12px',
                                                color: isDeny ? '#cf1322' : (isWait ? '#d48806' : '#52c41a')
                                            }}
                                        >
                                            {isDeny ? 'Платёж отклонён системой' : (isWait ? 'Платёж приостановлен' : 'Проверка пройдена')}
                                        </Text>
                                        <Text type="secondary" style={{fontSize: '11px'}}>
                                            {isDeny
                                                ? 'Сработали критические правила блокировки'
                                                : (isWait ? 'Требуется проверка оператором' : 'Уровень риска в норме')}
                                        </Text>
                                    </Space>
                                </div>
                            )
                        }
                    );

                    // 3. Действия оператора и уведомления
                    if (Array.isArray(entry.operator_actions) && entry.operator_actions.length > 0) {
                        const hasFinalDecision = entry.operator_actions?.some(
                            (action) => {
                                return ['approve', 'reject', 'deny', 'allow'].includes(action.action);
                            }
                        );

                        entry.operator_actions.forEach(
                            (action, idx) => {
                                const isBot = action.action === 'bot_notification';
                                const isReject = action.action === 'reject' || action.action === 'deny';

                                const statusColor = isBot ? '#5865F2' : (isReject ? '#f14f46' : '#52c41a');
                                const currentIcon = isBot ? faDiscord : (isReject ? Icons.faBan : Icons.faCircleCheck);
                                const cardClass = isBot
                                    ? 'af-bot-notification-card'
                                    : (isReject ? 'af-op-card-reject' : 'af-op-card-approve');

                                const isLastActionInArray = idx === entry.operator_actions.length - 1;
                                const isNeedDashedLine = !isLastActionInArray || (isLastActionInArray && !hasFinalDecision && isWait && isLastEntry);

                                items.push(
                                    {
                                        className: (isBot && isNeedDashedLine) ? "af-dashed-line" : "",
                                        dot: (
                                            <Avatar
                                                size={26}
                                                icon={<FontAwesomeIcon icon={currentIcon}/>}
                                                style={{backgroundColor: statusColor}}
                                            />
                                        ),
                                        children: (
                                            <div
                                                className={`af-operator-card compact ${cardClass}`}
                                                style={{marginLeft: '10px'}}
                                                key={`op-${idx}`}
                                            >
                                                <div className='d-flex justify-content-between align-items-start'>
                                                    <div className="af-op-content">
                                                        {isBot ? (
                                                            <div className='d-flex flex-column'>
                                                                <Text strong style={{color: statusColor}}>
                                                                    Уведомление в Discord
                                                                </Text>
                                                                <Text type="secondary" style={{fontSize: '11px'}}>
                                                                    ID сообщения {action.message_id || 'NaN'}
                                                                </Text>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <Text strong style={{color: statusColor}}>
                                                                    {isReject ? 'Отклонено оператором' : 'Разрешено оператором'}
                                                                </Text>
                                                                <Text type="secondary"
                                                                      style={{fontSize: '11px', marginLeft: '8px'}}>
                                                                    {action.operator_name}
                                                                </Text>
                                                            </>
                                                        )}
                                                        {action.comment && (
                                                            <div className="af-op-comment-text">
                                                                <Text italic>«{action.comment}»</Text>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Text type="secondary" style={{fontSize: '11px'}}>
                                                        {action.at}
                                                    </Text>
                                                </div>
                                            </div>
                                        )
                                    }
                                );
                            }
                        );
                    }

                    // 4. Форма ввода решения
                    if (isWait && isLastEntry && canOperate) {
                        items.push(
                            {
                                dot: (
                                    <Avatar
                                        size={26}
                                        icon={<FontAwesomeIcon icon={Icons.faUserPen}/>}
                                        style={{backgroundColor: '#faad14'}}
                                    />
                                ),
                                children: (
                                    <div className="af-operator-action-form" style={{marginLeft: '10px'}}>
                                        <Text strong style={{display: 'block', marginBottom: '8px'}}>
                                            Ожидание решения оператора
                                        </Text>
                                        <TextArea
                                            placeholder="Введите обоснование решения..."
                                            rows={2}
                                            value={comment}
                                            onChange={(e) => {
                                                setComment(e.target.value);
                                            }}
                                            style={{marginBottom: '12px', fontSize: '13px'}}
                                        />
                                        <Space>
                                            <Button
                                                type="primary"
                                                size="small"
                                                icon={<FontAwesomeIcon icon={Icons.faCheck}/>}
                                                loading={submitting}
                                                style={{backgroundColor: '#52c41a', border: 'none'}}
                                                onClick={() => {
                                                    handleAction('allow', entry.id);
                                                }}
                                            >
                                                Разрешить платеж
                                            </Button>
                                            <Button
                                                danger
                                                size="small"
                                                icon={<FontAwesomeIcon icon={Icons.faXmark}/>}
                                                loading={submitting}
                                                onClick={() => {
                                                    handleAction('deny', entry.id);
                                                }}
                                            >
                                                Отклонить
                                            </Button>
                                        </Space>
                                    </div>
                                )
                            }
                        );
                    }
                }
            );

            return items;
        },
        [loading, history, payment, expandAll, comment, submitting, apparatsList, dealersList, servicesList, serversList]
    );

    return (
        <div className="af-refined-container">
            <Divider orientation="left" plain>
                <Title level={5}>Детализация Антифрод анализа</Title>
            </Divider>

            <div className="af-timeline-scroll-area mt-4">
                {loading && history.length === 0 ? (
                    <div className="p-3">
                        <RuleSkeleton/>
                        <RuleSkeleton/>
                        <RuleSkeleton/>
                    </div>
                ) : (
                    <Timeline className="af-modern-timeline-v2" items={timelineItems}/>
                )}
            </div>

            {payment && (
                <div className="mt-4">
                    <Divider orientation="left" plain>
                        <Text type="secondary">Данные платежа</Text>
                    </Divider>
                    <PaymentDescriptionCard
                        record={payment}
                        session={session}
                        servicesList={servicesList}
                        dealersList={dealersList}
                        apparatsList={apparatsList}
                        serversList={serversList}
                    />
                </div>
            )}
        </div>
    );
};

export default PaymentRulesDetails;
