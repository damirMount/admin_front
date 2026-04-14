import React from "react";
import {Divider, Space, Tag, Typography} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faArrowRightLong,
    faClockRotateLeft,
    faDatabase,
    faGlobe,
    faLayerGroup,
    faShieldHalved
} from "@fortawesome/free-solid-svg-icons";
import {ALL_OPERATORS, SUBJECTS} from "../../../../../../components/pages/security/anti-fraud/constants";
import CodeBlock from "../../../../../../components/main/DataDisplay/CodeBlock/CodeBlock";

const {Text} = Typography;

const styles = {
    container: {
        background: '#fcfcfc'
    },
    mainCard: {
        minHeight: '100%'
    },
    iconBox: {
        width: '36px',
        height: '36px'
    },
    statusTag: {
        borderRadius: '100px',
        fontWeight: 600,
        border: 'none'
    },
    conditionRow: {
        background: '#fff',
        border: '1px solid #f0f0f0',
        borderLeft: '4px solid #1890ff'
    },
    labelSmall: {
        fontSize: '9px',
        display: 'block',
        fontWeight: 700
    },
    operatorTag: {
        margin: 0,
        fontSize: '10px',
        fontWeight: 800,
        border: 'none',
        background: '#fff1f0'
    },
    sourceTag: {
        fontSize: '9px',
        lineHeight: '16px',
        padding: '0 4px',
        margin: 0,
        background: '#f5f5f5',
        color: '#8c8c8c'
    },
    dynamicSubject: {
        fontSize: '11px',
        color: '#595959',
        background: '#f0f5ff',
        padding: '1px 6px',
        borderRadius: '4px'
    }
};

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

const ConditionRow = ({condition: c}) => {
    return (
        <div
            className="d-flex align-items-center p-2 rounded-3 mb-2 flex-wrap"
            style={{
                ...styles.conditionRow,
                gap: '8px 0'
            }}
        >
            {/* ОБЪЕКТ — 15% ширины */}
            <div
                className="ps-2"
                style={{
                    flex: '1 1 15%',
                    minWidth: '120px'
                }}
            >
                <Text
                    type="secondary"
                    style={styles.labelSmall}
                >
                    ОБЪЕКТ
                </Text>
                <Space size={4}>
                    <FontAwesomeIcon
                        icon={faDatabase}
                        style={{fontSize: '10px', color: '#bfbfbf'}}
                    />
                    <Text
                        strong
                        style={{fontSize: '11px'}}
                    >
                        {getSubjectLabel(c.subject)}
                    </Text>
                </Space>
            </div>

            {/* ПАРАМЕТР — 25% ширины */}
            <div
                className="px-3 border-start"
                style={{
                    flex: '1 1 25%',
                    minWidth: '150px'
                }}
            >
                <Text
                    type="secondary"
                    style={styles.labelSmall}
                >
                    ПАРАМЕТР
                </Text>
                <Text
                    strong
                    style={{fontSize: '12px', display: 'block'}}
                    ellipsis
                >
                    {getFieldLabel(c.subject, c.field)}
                </Text>
            </div>

            {/* УСЛОВИЕ — 15% ширины */}
            <div
                className="px-3 border-start text-center"
                style={{
                    flex: '1 1 15%',
                    minWidth: '100px'
                }}
            >
                <Text
                    type="secondary"
                    style={styles.labelSmall}
                >
                    УСЛОВИЕ
                </Text>
                <Tag
                    color="error"
                    plain
                    style={styles.operatorTag}
                >
                    {getOperatorLabel(c.operator).toUpperCase()}
                </Tag>
            </div>

            {/* ЗНАЧЕНИЕ — Занимает все оставшееся место */}
            <div
                className="px-3 border-start"
                style={{
                    flex: '2 1 30%',
                    minWidth: '200px'
                }}
            >
                <Text
                    type="secondary"
                    style={styles.labelSmall}
                >
                    ЗНАЧЕНИЕ
                </Text>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                    <Tag
                        bordered={false}
                        style={styles.sourceTag}
                    >
                        {c.value_type === 'field' ? 'ПОЛЕ' : 'ЗНАЧЕНИЕ'}
                    </Tag>

                    {c.value_type === 'field' && c.target_subject ? (
                        <div
                            className="d-flex align-items-center flex-wrap"
                            style={{color: '#1677ff'}}
                        >
                            <Text
                                strong
                                style={styles.dynamicSubject}
                            >
                                {getSubjectLabel(c.target_subject)}
                            </Text>
                            <FontAwesomeIcon
                                icon={faArrowRightLong}
                                style={{margin: '0 6px', fontSize: '10px', opacity: 0.3}}
                            />
                            <Text
                                strong
                                style={{fontSize: '13px', color: '#1677ff'}}
                                ellipsis
                            >
                                {getFieldLabel(c.target_subject, c.value || c.target_field)}
                            </Text>
                        </div>
                    ) : (
                        <Text
                            strong
                            style={{fontSize: '14px', color: '#262626'}}
                        >
                            {formatValue(c.value)}
                        </Text>
                    )}
                </div>
            </div>
        </div>
    );
};

const RuleCard = ({record, serviceMap}) => {
    const isActive = record.is_active;
    const params = record.params || {};
    const conditions = params.conditions || [];
    const actionType = params.action_type;
    const riskValue = params.risk_value ?? 0;
    const timeRange = params.time_range || [];
    const hasTime = timeRange?.length === 2 && timeRange[0];

    return (
        <div
            className="p-3 af-expandable-row"
            style={styles.container}
        >
            <div className="row g-4 ">
                <div className="col-md-12">
                    <div
                        className="af-info-card bg-white p-4 rounded-3 border shadow-sm d-flex flex-column"
                        style={styles.mainCard}
                    >
                        <div className="mb-4 d-flex justify-content-between align-items-start">
                            <Space size={12}>
                                <div
                                    className="bg-primary bg-opacity-10 p-2 rounded-circle d-flex align-items-center justify-content-center"
                                    style={styles.iconBox}
                                >
                                    <FontAwesomeIcon
                                        icon={faShieldHalved}
                                        className="text-primary"
                                    />
                                </div>
                                <div>
                                    <Text
                                        type="secondary"
                                        style={{
                                            fontSize: '10px',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            display: 'block'
                                        }}
                                    >
                                        Алгоритм
                                    </Text>
                                    <Text
                                        strong
                                        style={{fontSize: '14px', color: '#141414'}}
                                    >
                                        {record.name || "Без названия"}
                                    </Text>
                                </div>
                            </Space>
                            <Tag
                                color={isActive ? "success" : "default"}
                                style={styles.statusTag}
                            >
                                {isActive ? '● АКТИВНО' : '● ПАУЗА'}
                            </Tag>
                        </div>

                        <div className="flex-grow-1">
                            <div className="d-flex flex-column gap-2 mb-4">
                                {conditions.length > 0 ? (
                                    conditions.map(
                                        (c, idx) => {
                                            return (
                                                <ConditionRow
                                                    key={idx}
                                                    condition={c}
                                                />
                                            );
                                        }
                                    )
                                ) : (
                                    <div
                                        className="p-4 text-center border rounded-3 bg-light"
                                        style={{borderStyle: 'dashed'}}
                                    >
                                        <Text type="secondary">
                                            Критерии анализа не заданы
                                        </Text>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-3 border-top mt-auto">
                            <div className="row align-items-center">
                                <div className="col-6">
                                    <Text
                                        type="secondary"
                                        style={{
                                            fontSize: '10px',
                                            display: 'block',
                                            fontWeight: 700,
                                            marginBottom: '4px'
                                        }}
                                    >
                                        РЕАКЦИЯ
                                    </Text>
                                    {actionType === 'block' ? (
                                        <Tag
                                            color="red"
                                            style={{fontWeight: 700}}
                                        >
                                            🛑 БЛОКИРОВКА
                                        </Tag>
                                    ) : (
                                        <Tag
                                            color={actionType === 'multiply' ? 'purple' : 'orange'}
                                            style={{fontWeight: 700}}
                                        >
                                            {actionType === 'multiply' ? `✖️ x${riskValue}` : `➕ +${riskValue} к риску`}
                                        </Tag>
                                    )}
                                </div>
                                {hasTime && (
                                    <div className="col-6 border-start">
                                        <Text
                                            type="secondary"
                                            style={{
                                                fontSize: '10px',
                                                display: 'block',
                                                fontWeight: 700,
                                                marginBottom: '4px'
                                            }}
                                        >
                                            ПЕРИОД
                                        </Text>
                                        <Text
                                            strong
                                            style={{fontSize: '12px'}}
                                        >
                                            <FontAwesomeIcon
                                                icon={faClockRotateLeft}
                                                className="me-1 text-primary"
                                            />
                                            {timeRange[0]} — {timeRange[1]}
                                        </Text>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="d-flex flex-column gap-3 h-100">
                        <div className="af-info-card bg-white p-4 rounded-3 border shadow-sm">
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <FontAwesomeIcon
                                    icon={faLayerGroup}
                                    className="text-secondary"
                                />
                                <Text
                                    strong
                                    style={{fontSize: '12px'}}
                                >
                                    ОБЛАСТЬ ПРИМЕНЕНИЯ
                                </Text>
                            </div>
                            <Divider style={{margin: '12px 0'}}/>
                            <div className="d-flex flex-wrap gap-2">
                                {record.service_types_ids?.length > 0 ? (
                                    record.service_types_ids.map(
                                        (id) => {
                                            return (
                                                <Tag
                                                    key={id}
                                                    color="blue"
                                                    bordered={false}
                                                    className='text-wrap'
                                                    style={{fontSize: '11px', fontWeight: 600}}
                                                >
                                                    {serviceMap[id] || id}
                                                </Tag>
                                            );
                                        }
                                    )
                                ) : (
                                    <div
                                        className="d-flex align-items-center text-center py-4 rounded-3 w-100 flex-column"
                                        style={{background: '#fafafa', border: '1px dashed #d9d9d9'}}>
                                        <FontAwesomeIcon
                                            icon={faGlobe}
                                            style={{fontSize: '24px'}}
                                            className="text-secondary mb-2"
                                        />
                                        <Text type="secondary" style={{fontSize: '12px'}}>Применяется ко всем
                                            сервисам</Text>
                                    </div>
                                )}
                            </div>
                        </div>


                    </div>
                </div>
                <div className="col-md-8 mt-2">
                    <CodeBlock
                        code={record.params}
                        title="JSON DATA"
                    />
                </div>
            </div>

        </div>
    );
};

export default RuleCard;
