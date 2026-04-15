import React from 'react';
import {Form, Input, Modal, Space, Typography} from 'antd';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowDown, faGears} from "@fortawesome/free-solid-svg-icons";


import ReactionPanel from "./ReactionPanel";
import ConditionList from "./ConditionList";
import RuleHeader from "./RuleHeader";

const {Text} = Typography;

const RuleFormModal = ({open, onCancel, onFinish, form, serviceTypes, dealersList, apparatsList, servicesList}) => {
    const formValues = Form.useWatch([], form) || {};
    const {is_active: isActive, action_type: actionType, risk_value: riskValue} = formValues;

    const handleSubmit = (values) => {

        const {
            id,
            name,
            is_active,
            service_types_ids,
            description,
            risk_value,
            ...paramsData
        } = values;

        const payload = {
            id: id,
            name: name,
            is_active: is_active,
            service_types_ids: service_types_ids,
            description,
            params: {
                ...paramsData,
                risk_value: risk_value,
                time_range: values.time_range
                    ? [values.time_range[0].format('HH:mm'), values.time_range[1].format('HH:mm')]
                    : null,
                conditions: values.conditions || []
            }
        };

        if (onFinish) {
            onFinish(payload);
        }
    };

    const handleValuesChange = (changedValues) => {
        if (changedValues.action_type) {
            const defaultValue = changedValues.action_type === 'multiply' ? 1.0 : 10;
            form.setFieldValue('risk_value', defaultValue);
        }
    };


    return (
        <Modal
            title={
                <Space>
                    <FontAwesomeIcon icon={faGears} style={{color: '#1677ff'}}/>
                    <Text strong>Конструктор алгоритма анализа</Text>
                </Space>
            }
            maskClosable={false}
            open={open}
            onCancel={onCancel}
            onOk={() => {
                form.submit();
            }}
            okText="Сохранить изменения"
            width={1000}
            centered
            className="rf-modal"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                onValuesChange={handleValuesChange}
            >
                <Form.Item name="id" hidden>
                    <Input/>
                </Form.Item>

                <RuleHeader isActive={formValues.is_active} serviceTypes={serviceTypes}/>

                <div className="border rounded-3 overflow-hidden mb-4">
                    <ConditionList form={form} dealersList={dealersList} servicesList={servicesList}
                                   apparatsList={apparatsList}/>

                    <div className="rf-arrow-divider">
                        <div className="rf-arrow-icon-wrapper">
                            <FontAwesomeIcon icon={faArrowDown} size="xs"/>
                        </div>
                    </div>

                    <ReactionPanel/>
                </div>
            </Form>
        </Modal>
    );
};

export default RuleFormModal;
