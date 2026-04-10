import React, {useState} from "react";
import {Col, Row, Typography, Modal, Form, Input, Select, Button, message} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import * as Icons from "@fortawesome/free-solid-svg-icons";
import {faClock} from "@fortawesome/free-regular-svg-icons";
import './ProfileWhitelistCard.css';
import {MoneyFormatNumber} from "../../../../main/system/MoneyFormatNumber";
import FormatDate from "../../../../main/system/FormatDate";

const {Text, Title} = Typography;

const ProfileWhitelistCard = ({client, onUpdate}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    if (!client) return null;

    const showModal = () => {
        form.setFieldsValue({
            full_name: client.full_name,
            status: client.status || 'NEW',
            identifier: client.identifier,
            passport_inn: client.passport_inn || client.identifier,
            email: client.email || '',
            comment: client.comment || ''
        });
        setIsModalOpen(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            if (onUpdate) await onUpdate({id: client.id, ...values});
            setIsModalOpen(false);
            message.success("Данные обновлены");
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    return (
        <>
            <div className="af-whitelist-panel shadow-sm">
                {/* ПЕРВАЯ ЛИНИЯ (Твой дизайн 8/16) */}
                <Row gutter={0} align="middle">
                    <Col span={8} className="af-panel-section main-info">
                        <div className="af-metric w-100">
                            <div className="af-metric-icon small-icon">
                                <FontAwesomeIcon icon={Icons.faUserTag}/>
                            </div>
                            <div className="af-metric-data w-100">
                                <div className="d-flex justify-content-between align-items-center w-100 ">
                                    <Text className="af-tiny-label" style={{whiteSpace: 'nowrap'}}>ФИО / КЛИЕНТ</Text>
                                    <Text copyable={{text: String(client.id)}} className="af-tiny-label">ID: {client.id}</Text>
                                </div>
                                <div className="d-flex align-items-center">
                                    <Text strong className="af-metric-value">
                                        {client?.full_name || 'Анонимный клиент'}
                                    </Text>
                                    <Button type="text" size="small" onClick={showModal} icon={
                                        <FontAwesomeIcon icon={Icons.faPen} style={{fontSize: 10, color: '#1890ff', }}/>}/>
                                </div>
                            </div>
                        </div>
                    </Col>

                    <Col span={16} className="af-panel-section stats-info">
                        <Row gutter={[16, 8]}>
                            <Col span={8}>
                                <div className="af-metric">
                                    <div className="af-metric-icon"><FontAwesomeIcon icon={Icons.faSackDollar}/></div>
                                    <div className="af-metric-data">
                                        <Text className="af-tiny-label">ОБОРОТ</Text>
                                        <Text strong className="af-metric-value">{MoneyFormatNumber(client?.avg_amount || 0, 'full')} сом</Text>
                                    </div>
                                </div>
                            </Col>
                            <Col span={8}>
                                <div className="af-metric">
                                    <div className="af-metric-icon"><FontAwesomeIcon icon={Icons.faShoppingCart}/></div>
                                    <div className="af-metric-data">
                                        <Text className="af-tiny-label">ПЛАТЕЖЕЙ</Text>
                                        <Text strong className="af-metric-value">{client?.total_payments || 0}</Text>
                                    </div>
                                </div>
                            </Col>
                            <Col span={8}>
                                <div className="af-metric">
                                    <div className="af-metric-icon"><FontAwesomeIcon icon={Icons.faCoins}/></div>
                                    <div className="af-metric-data">
                                        <Text className="af-tiny-label">СРЕДНИЙ ЧЕК</Text>
                                        <Text strong className="af-metric-value">{MoneyFormatNumber(client?.avg_amount || 0, 'full')} сом</Text>
                                    </div>
                                </div>
                            </Col>

                        </Row>
                    </Col>
                </Row>

                {/* ВТОРАЯ ЛИНИЯ (Твой дизайн 8/16) */}
                <Row gutter={0} align="middle" className='border-top'>
                    <Col span={8} className="af-panel-section main-info">
                        <div className="af-status-wrapper">
                            <div className={`af-status-badge ${client?.status?.toLowerCase() || 'new'}`} onClick={showModal} style={{cursor: 'pointer'}}>
                                <FontAwesomeIcon icon={
                                    client?.status === 'TRUSTED' ? Icons.faUserShield :
                                        client?.status === 'BLOCKED' ? Icons.faBan : Icons.faUserClock
                                }/>
                                <span>{client?.status || 'NEW'}</span>
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

                    <Col span={16} className="af-panel-section stats-info">
                        <Row gutter={[16, 8]}>
                            <Col span={8}>
                                <div className="af-metric">
                                    <div className="af-metric-icon small-icon"><FontAwesomeIcon icon={Icons.faPhone}/></div>
                                    <div className="af-metric-data">
                                        <Text className="af-tiny-label">НОМЕР ДЛЯ СВЯЗИ</Text>
                                        <Text strong className="af-metric-value">{client?.identifier || '—'}</Text>
                                    </div>
                                </div>
                            </Col>
                            <Col span={8}>
                                <div className="af-metric">
                                    <div className="af-metric-icon small-icon"><FontAwesomeIcon icon={Icons.faAddressCard}/></div>
                                    <div className="af-metric-data">
                                        <Text className="af-tiny-label">ID ПАСПОРТА / ИНН</Text>
                                        <Text strong className="af-metric-value">{client?.passport_inn || client?.identifier || '—'}</Text>
                                    </div>
                                </div>
                            </Col>
                            <Col span={8}>
                                <div className="af-metric">
                                    <div className="af-metric-icon"><FontAwesomeIcon icon={Icons.faClockRotateLeft}/></div>
                                    <div className="af-metric-data">
                                        <Text className="af-tiny-label">ПОСЛЕДНИЙ ПЛАТЁЖ</Text>
                                        <Text strong className="af-metric-value">{client?.last_payment_at ? FormatDate(client['last_payment_at']) : '—'}</Text>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                {/* ТРЕТЬЯ ЛИНИЯ (Футер) */}
                <Row gutter={0} align="middle" className='border-top'>
                    <Col span={12} className="af-panel-section p-2 main-info d-flex justify-content-between">
                        <Text type={"secondary"} className='af-text-xs fw-bold ms-3'>Последние изменения</Text>
                        <Text type={"secondary"} className='af-text-xs fw-bold me-3'>{client.updatedAt ? FormatDate(client.updatedAt) : '10.04.26 16:58:50'}</Text>
                    </Col>
                    <Col span={12} className="p-2 d-flex justify-content-between">
                        <Text type={"secondary"} className='af-text-xs fw-bold ms-3'>ОПЕРАТОР</Text>
                        <Text type={"secondary"} className='af-text-xs fw-bold me-3'>{client.operator_name || 'Никита Копыльцов'}</Text>
                    </Col>
                </Row>
            </div>

            {/* МОДАЛКА (Единственное место, где дизайн отличается от карточки) */}
            <Modal title="Редактирование данных" open={isModalOpen} onOk={handleOk} onCancel={() => setIsModalOpen(false)} confirmLoading={loading}>
                <Form form={form} layout="vertical" className="mt-3">
                    <Form.Item name="full_name" label="ФИО Клиента"><Input /></Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="status" label="Статус">
                                <Select options={['NEW','TRUSTED','REGULAR','PROBATION','BLOCKED'].map(s => ({label: s, value: s}))} />
                            </Form.Item>
                        </Col>
                        <Col span={12}><Form.Item name="identifier" label="Телефон"><Input /></Form.Item></Col>
                    </Row>
                    <Form.Item name="passport_inn" label="ИНН / Паспорт"><Input /></Form.Item>
                    <Form.Item name="email" label="Email"><Input /></Form.Item>
                    <Form.Item name="comment" label="Комментарий оператора"><Input.TextArea rows={3} /></Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default ProfileWhitelistCard;
