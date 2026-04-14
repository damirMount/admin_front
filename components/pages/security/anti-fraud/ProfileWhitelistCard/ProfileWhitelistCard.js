import React, {useEffect, useState} from "react";
import {Col, Row, Typography} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import * as Icons from "@fortawesome/free-solid-svg-icons";
import {faClockRotateLeft, faCoins, faSackDollar, faShoppingCart} from "@fortawesome/free-solid-svg-icons";
import './ProfileWhitelistCard.css';
import {MoneyFormatNumber} from "../../../../main/system/MoneyFormatNumber";
import FormatDate from "../../../../main/system/FormatDate";
import {USERS_TRUST_STATUS} from "../constants";
import md5 from "md5";
import {getUserFio} from "../../../../main/system/GetUserFio";

const {Text, Title} = Typography;

const ProfileWhitelistCard = ({client, session}) => {
    const [operatorName, setOperatorName] = useState(null);
    const [loadingOperator, setLoadingOperator] = useState(false);

    useEffect(() => {
        if (operatorName) {
            return
        }
        const fetchOperator = async () => {
            if (client?.update_author_id) {
                setLoadingOperator(true);

                const name = await getUserFio(client.update_author_id, session);

                setOperatorName(`${name} `);
                setLoadingOperator(false);
            }
        };
        fetchOperator();
    }, [client?.update_author_id, session]);

    if (!client) {
        return null;
    }

    const statusMap = USERS_TRUST_STATUS;
    const style = statusMap[client.status] || statusMap.undefind; // Проверь опечатку undefind -> undefined в константах
    const combinedKey = `prof:*:{${client.id_service ?? 'null'}:${md5(client.identifier ?? 'null')}}`;
    return (<>
        <div className="af-whitelist-panel shadow-sm">
            {/* ПЕРВАЯ ЛИНИЯ */}
            <Row gutter={0} align="middle">
                <Col span={9} className="af-panel-section main-info">
                    <div className="af-metric w-100">
                        <div className="af-metric-icon small-icon">
                            <FontAwesomeIcon icon={Icons.faUserTag}/>
                        </div>
                        <div className="af-metric-data w-100">
                            <div className="d-flex justify-content-between align-items-center w-100 ">
                                <Text className="af-tiny-label">ФИО / КЛИЕНТ</Text>
                                <Text copyable={{text: String(client.id)}}
                                      className="af-tiny-label">ID: {client.id}</Text>
                            </div>
                            <div className="d-flex align-items-center">
                                <Text strong className="af-metric-value">
                                    {client?.full_name || 'Анонимный клиент'}
                                </Text>
                            </div>
                        </div>
                    </div>
                </Col>

                <Col span={15} className="af-panel-section stats-info">
                    <Row gutter={[16, 8]}>
                        <Col span={8}>
                            <div className="af-metric">
                                <div className="af-metric-icon"><FontAwesomeIcon icon={faSackDollar}/></div>
                                <div className="af-metric-data">
                                    <Text className="af-tiny-label">ОБОРОТ</Text>
                                    <Text strong
                                          className="af-metric-value">{MoneyFormatNumber(client?.total_amount || 0, 'full')} сом</Text>
                                </div>
                            </div>
                        </Col>
                        <Col span={8}>
                            <div className="af-metric">
                                <div className="af-metric-icon"><FontAwesomeIcon icon={faShoppingCart}/></div>
                                <div className="af-metric-data">
                                    <Text className="af-tiny-label">ПЛАТЕЖЕЙ</Text>
                                    <Text strong className="af-metric-value">{client?.total_payments || 0}</Text>
                                </div>
                            </div>
                        </Col>
                        <Col span={8}>
                            <div className="af-metric">
                                <div className="af-metric-icon"><FontAwesomeIcon icon={faCoins}/></div>
                                <div className="af-metric-data">
                                    <Text className="af-tiny-label">СРЕДНИЙ ЧЕК</Text>
                                    <Text strong
                                          className="af-metric-value">{MoneyFormatNumber(client?.avg_amount || 0, 'full')} сом</Text>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Col>
            </Row>

            {/* ВТОРАЯ ЛИНИЯ */}
            <Row gutter={0} align="middle" className='border-top'>
                <Col span={9} className="af-panel-section main-info">
                    <div className="af-status-wrapper">
                        <div
                            className={`af-status-badge ${client?.status?.toLowerCase() || 'new'}`}
                        >
                            {style?.icon}
                            <span className='text-uppercase'>{style?.label || 'NEW'}</span>
                        </div>
                        <div className="af-score-display text-end">
                            <Text className="af-tiny-label">УРОВЕНЬ ДОВЕРИЯ</Text>
                            <Title level={3} style={{margin: 0, color: '#1890ff'}}>
                                {client?.trust_score || 0}
                                <small style={{fontSize: '14px', color: '#bfbfbf', fontWeight: 400}}> / 100</small>
                            </Title>
                        </div>
                    </div>
                </Col>

                <Col span={15} className="af-panel-section stats-info">
                    <Row gutter={[16, 8]}>
                        <Col span={8}>
                            <div className="af-metric">
                                <div className="af-metric-icon small-icon"><FontAwesomeIcon icon={Icons.faPhone}/>
                                </div>
                                <div className="af-metric-data">
                                    <Text className="af-tiny-label">НОМЕР ДЛЯ СВЯЗИ</Text>
                                    <Text strong
                                          className="af-metric-value">{client?.phone || '—'}</Text>
                                </div>
                            </div>
                        </Col>
                        <Col span={8}>
                            <div className="af-metric">
                                <div className="af-metric-icon small-icon"><FontAwesomeIcon
                                    icon={Icons.faAddressCard}/></div>
                                <div className="af-metric-data">
                                    <Text className="af-tiny-label">ИНН / ПАСПОРТ</Text>
                                    <Text strong
                                          className="af-metric-value">{client?.inn || '—'}</Text>
                                </div>
                            </div>
                        </Col>
                        <Col span={8}>
                            <div className="af-metric">
                                <div className="af-metric-icon"><FontAwesomeIcon icon={faClockRotateLeft}/></div>
                                <div className="af-metric-data">
                                    <Text className="af-tiny-label">ПОСЛЕДНИЙ ПЛАТЁЖ</Text>
                                    <Text strong
                                          className="af-metric-value">{client?.last_payment_at ? FormatDate(client.last_payment_at) : '—'}</Text>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Col>
            </Row>
            {client.operator_update_at && (
                <Row gutter={0} className='border-top'>
                    <Col span={9}
                         className="p-2  d-flex af-panel-section main-info d-flex flex-column
                          align-items-start">
                        <div className='d-flex justify-content-between align-items-center w-100'>
                            <Text type="secondary" className='af-tiny-label ms-3'>ОБНОВЛЕНО ОПЕРАТОРОМ:</Text>
                            <Text className='me-2 af-text-sm fw-medium'>
                                {loadingOperator ? 'Загрузка...' : (
                                    operatorName || 'Система'
                                )}
                            </Text>
                        </div>
                        <div className='d-flex justify-content-between align-items-center w-100'>
                            <Text type="secondary"
                                  className='af-tiny-label ms-3'>ДАТА:</Text>
                            <Text
                                className='af-text-sm fw-medium me-2'>{FormatDate(client.operator_update_at)}
                            </Text>
                        </div>
                    </Col>
                    <Col span={15} className="p-2 px-4 ">
                        <Text type="secondary" className="af-tiny-label d-block mt-1">КОММЕНТАРИЙ:</Text>
                        <Typography.Paragraph
                            placeholder='Комментарий отсутствует'
                            ellipsis={{rows: 1, expandable: true, symbol: 'развернуть'}}
                            style={{marginBottom: 0, fontSize: '13px', color: '#434343'}}
                        >
                            {client.comment !== '' ? client.comment :
                                <Text type='secondary' className='af-text-xs fst-italic'> Комментарий отсутствует</Text>
                            }
                        </Typography.Paragraph>
                    </Col>
                </Row>)}

            {/* ТРЕТЬЯ ЛИНИЯ (Футер) */}
            <Row gutter={0} align="middle" className='border-top'>
                <Col span={9} className="af-panel-section main-info p-2 d-flex justify-content-between">
                    <Text type="secondary" className='af-text-xs ms-3'>REDIS KEY</Text>
                    <Text type="secondary" className='af-text-xs me-2' copyable={true}>
                        {combinedKey}
                    </Text>
                </Col>
                <Col span={15} className="p-2 d-flex justify-content-between">
                    <Text type="secondary" className='af-text-xs ms-3'>Создано:
                        <span className='ms-1'>{FormatDate(client.createdAt)}</span>
                    </Text>

                    <Text type="secondary" className='af-text-xs me-3'>Изменено:
                        <span className='ms-1'>{FormatDate(client.updatedAt)}</span>
                    </Text>
                </Col>
            </Row>
        </div>


    </>);
};

export default ProfileWhitelistCard;
