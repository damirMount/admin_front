import React, {useEffect, useState} from "react";
import {Alert, Col, Form, Input, Modal, Row, Select, Space, Typography} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import * as Icons from "@fortawesome/free-solid-svg-icons";

const {Text} = Typography;

const EditProfileModal = ({open, onCancel, onSave, loading, initialData}) => {
    const [form] = Form.useForm();
    const [showNameWarning, setShowNameWarning] = useState(false);


    useEffect(() => {
        if (open) {
            form.setFieldsValue({
                full_name: initialData?.full_name || '',
                status: initialData?.status || 'NEW',
                phone: initialData?.phone || '',
                inn: initialData?.inn || '',
                comment: initialData?.comment || ''
            });
            setShowNameWarning(false);
        }
    }, [open, initialData, form]);

    const handleConfirm = async () => {
        try {
            const values = await form.validateFields();

            // Логика предупреждения: если ФИО было, а стало пустым
            const wasNameSet = Boolean(initialData?.full_name);
            const isNameEmpty = !values.full_name || values.full_name.trim() === '';

            if (wasNameSet && isNameEmpty && !showNameWarning) {
                setShowNameWarning(true);
                return;
            }

            await onSave(values);
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

    return (
        <Modal
            title={
                <Space>
                    <FontAwesomeIcon icon={Icons.faUserEdit} style={{color: '#1890ff'}}/>
                    <span>Редактирование профиля</span>
                </Space>
            }
            open={open}
            onOk={handleConfirm}
            onCancel={onCancel}
            confirmLoading={loading}
            okText={showNameWarning ? "Все равно сохранить" : "Сохранить"}
            cancelText="Отмена"
            width={550}
            destroyOnClose
        >
            <Form form={form} layout="vertical" className="mt-3">
                {showNameWarning && (
                    <Alert
                        message="Внимание: удаление ФИО"
                        description="Вы очистили ранее установленное ФИО клиента. После сохранения клиент будет отображаться как 'Анонимный'."
                        type="warning"
                        showIcon
                        className="mb-3"
                    />
                )}

                <Form.Item
                    name="full_name"
                    label={<Text strong>ФИО Клиента</Text>}
                >
                    <Input
                        prefix={<FontAwesomeIcon icon={Icons.faUser} className="text-muted me-2"/>}
                        placeholder="Введите полное имя"
                        onChange={() => {
                            if (showNameWarning) {
                                setShowNameWarning(false);
                            }
                        }}
                    />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="status" label={<Text strong>Статус</Text>}>
                            <Select
                                options={[
                                    {label: 'НОВЫЙ', value: 'NEW'},
                                    {label: 'ДОВЕРЯННЫЙ', value: 'TRUSTED'},
                                    {label: 'ПОСТОЯННЫЙ', value: 'REGULAR'},
                                    {label: 'ПОДОЗРИТЕЛЬНЫЙ', value: 'PROBATION'},
                                    {label: 'ЗАБЛОКИРОВАН', value: 'BLOCKED'}
                                ]}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="phone" label={<Text strong>Телефон</Text>}>
                            <Input prefix={<FontAwesomeIcon icon={Icons.faPhone} className="text-muted me-2"/>}/>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="inn" label={<Text strong>ИНН / Номер паспорта</Text>}>
                    <Input prefix={<FontAwesomeIcon icon={Icons.faAddressCard} className="text-muted me-2"/>}/>
                </Form.Item>

                <Form.Item name="comment" label={<Text strong>Внутренний комментарий</Text>}>
                    <Input.TextArea
                        rows={3}
                        placeholder="Укажите важные детали о клиенте..."
                        style={{resize: 'none'}}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditProfileModal;
