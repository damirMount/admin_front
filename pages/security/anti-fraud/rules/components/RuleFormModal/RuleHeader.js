import React from 'react';
import {Form, Input, Select, Space, Switch, Typography} from 'antd';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTag} from "@fortawesome/free-solid-svg-icons";

const {Text} = Typography;
const {Option} = Select;

const RuleHeader = ({isActive, serviceTypes}) => {
    return (
        <div className={`rf-header-panel ${isActive === false ? 'is-paused' : ''}`}>
            <div className="d-flex justify-content-between align-items-start gap-4">
                <div className="flex-grow-1">
                    <Space style={{color: '#389e0d'}}>
                        <FontAwesomeIcon icon={faTag}/>
                        <Text strong className="rf-section-title">Название алгоритма</Text>
                    </Space>
                    <Form.Item name="name" rules={[{required: true}]} className="mb-0">
                        <Input variant="borderless" className="rf-name-input" placeholder="Введите название..."/>
                    </Form.Item>
                </div>
                <div className="text-end">
                    <Text className="rf-panel-label">Статус</Text>
                    <div className="mt-2 d-flex align-items-center gap-2">
                        <Text strong className={isActive ? 'text-success' : 'text-muted'}>
                            {isActive ? 'АКТИВНО' : 'ПАУЗА'}
                        </Text>
                        <Form.Item name="is_active" valuePropName="checked" className="mb-0">
                            <Switch size="small"/>
                        </Form.Item>
                    </div>
                </div>
            </div>
            <div className="mt-3">
                <Form.Item
                    name="service_types_ids"
                    label={<Text strong>Область применения</Text>}
                    className="mb-0"
                >
                    <Select
                        mode="multiple"
                        placeholder="Все сервисы"
                        allowClear
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) => {
                            return (option?.children ?? '').toLowerCase().includes(input.toLowerCase());
                        }}
                    >
                        {serviceTypes?.map((s) => {
                            return (
                                <Option key={s.id} value={Number(s.id)}>
                                    {s.name}
                                </Option>
                            );
                        })}
                    </Select>
                </Form.Item>
            </div>
        </div>
    );
};

export default RuleHeader;
