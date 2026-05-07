import React, {useMemo} from 'react';
import {Button, Card, Col, Divider, Form, Input, InputNumber, Row, Select, Space, TimePicker, Typography} from 'antd';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClock, faCube, faFilter, faPlus, faTrashCan} from "@fortawesome/free-solid-svg-icons";
import {
    ALL_OPERATORS,
    DAYS_OF_WEEK,
    SUBJECTS,
    TIME_WINDOWS
} from "../../../../../../components/pages/security/anti-fraud/constants";

const {Text} = Typography;

const ConditionList = ({form, dealersList = [], servicesList = [], apparatsList = []}) => {
    // Группируем все наши динамические списки в один объект для удобства поиска
    const allDynamicLists = {
        dealers: dealersList.map(d => ({value: String(d.id), label: `${d.id} ${d.name}`})),
        services: servicesList.map(s => ({value: String(s.id), label: `${s.id} ${s.name}`})),
        apparats: apparatsList.map(a => ({value: String(a.id), label: `${a.id} ${a.name}`})),
    };

    const dynamicSubjects = useMemo(() => {
        // Глубокое клонирование для безопасности (опционально, но лучше сделать так)
        const updated = JSON.parse(JSON.stringify(SUBJECTS));

        Object.keys(updated).forEach(subjectKey => {
            updated[subjectKey].fields = updated[subjectKey].fields.map(field => {

                // Если у поля есть маркер listName и у нас есть данные для этого маркера
                if (field.listName && allDynamicLists[field.listName]) {
                    return {
                        ...field,
                        fields: allDynamicLists[field.listName] // Вставляем список
                    };
                }
                return field;
            });
        });

        return updated;
    }, [dealersList]);

    const conditions = Form.useWatch('conditions', form) || [];

    const resetRow = (index) => {
        form.setFieldValue(['conditions', index, 'field'], undefined);
        form.setFieldValue(['conditions', index, 'operator'], undefined);
        form.setFieldValue(['conditions', index, 'value'], undefined);
    };

    const renderValueInput = (name, index) => {
        {
            const curr = conditions[index] || {};
            const isAggregate = ALL_OPERATORS.find(o => o.value === curr.operator)?.isAggregate;
            const isMultiple = curr.operator === 'in';

            const selectedSubject = dynamicSubjects[curr.subject || 'payment'];
            const selectedField = selectedSubject?.fields.find(f => f.value === curr.field);

            // Настройки сравнения из константы
            const compareConfig = selectedField?.compareWith || [];
            const hasCompareOption = compareConfig.length > 0;

            // 1. Агрегаты (count, sum, unique)
            if (isAggregate && curr.operator !== 'in') {
                {
                    return (
                        <Space.Compact className="w-100">
                            <Form.Item name={[name, 'time_window']} noStyle>
                                <Select style={{width: '30%'}} options={TIME_WINDOWS}/>
                            </Form.Item>
                            <Form.Item name={[name, 'sub_operator']} noStyle initialValue=">">
                                <Select style={{width: '40%'}} options={ALL_OPERATORS.filter(op => !op.isAggregate)}/>
                            </Form.Item>
                            <Form.Item name={[name, 'value']} noStyle rules={[{required: true}]}>
                                <InputNumber placeholder="0" style={{width: '30%'}}/>
                            </Form.Item>
                        </Space.Compact>
                    );
                }
            }

            // 2. Если для поля в константе прописаны варианты сравнения (например, для minpay)
            if (hasCompareOption) {
                {
                    const isFieldMode = curr.value_type === 'field';
                    const targetSubjectConfig = compareConfig.find(c => c.target_subject === curr.target_subject);

                    return (
                        <Space.Compact className="w-100">
                            <Form.Item name={[name, 'value_type']} noStyle initialValue="const">
                                <Select
                                    style={{width: '30%'}}
                                    onChange={() => {
                                        {
                                            form.setFieldValue(['conditions', name, 'value'], undefined);
                                            form.setFieldValue(['conditions', name, 'target_subject'], undefined);
                                        }
                                    }}
                                    options={[{value: 'const', label: 'Знач.'}, {value: 'field', label: 'Поле'}]}
                                />
                            </Form.Item>

                            {isFieldMode ? (
                                <>
                                    <Form.Item name={[name, 'target_subject']} noStyle rules={[{required: true}]}>
                                        <Select
                                            style={{width: '35%'}}
                                            placeholder="Объект"
                                            options={compareConfig.map(c => ({
                                                value: c.target_subject,
                                                label: c.label
                                            }))}
                                            onChange={() => form.setFieldValue(['conditions', name, 'value'], undefined)}
                                        />
                                    </Form.Item>
                                    <Form.Item name={[name, 'value']} noStyle rules={[{required: true}]}>
                                        <Select
                                            style={{width: '35%'}}
                                            placeholder="Поле"
                                            options={targetSubjectConfig?.fields || []}
                                        />
                                    </Form.Item>
                                </>
                            ) : (
                                <Form.Item name={[name, 'value']} noStyle rules={[{required: true}]}>
                                    {selectedField?.role === 'amount' ? (
                                        <InputNumber className="w-100" style={{width: '70%'}} placeholder="0.00"/>
                                    ) : (
                                        <Input className="w-100" style={{width: '70%'}} placeholder="Введите..."/>
                                    )}
                                </Form.Item>
                            )}
                        </Space.Compact>
                    );
                }
            }

            // 3. Стандартный ввод (включая динамические списки dealers, services, apparats)
            const hasSubFields = selectedField?.fields && selectedField.fields.length > 0;

            return (
                <Form.Item name={[name, 'value']} noStyle rules={[{required: true}]}>
                    {hasSubFields ? (
                        <Select
                            showSearch
                            optionFilterProp="label"
                            mode={isMultiple ? 'multiple' : undefined}
                            placeholder={isMultiple ? "Выбрать несколько..." : "Выбрать..."}
                            options={selectedField.fields}
                            className="w-100"
                        />
                    ) : (
                        selectedField?.role === 'amount' ? (
                            <InputNumber className="w-100" placeholder="0.00"/>
                        ) : (
                            <Input className="w-100" placeholder="Введите значение..."/>
                        )
                    )}
                </Form.Item>
            );
        }
    };

    return (
        <div className="p-3">
            <Space className="mb-2 text-primary">
                <FontAwesomeIcon icon={faFilter}/>
                <Text strong>Условия</Text>
            </Space>

            <Form.List name="conditions">
                {(fields, {add, remove}) => (
                    <>
                        {fields.map(({key, name, ...restField}) => {
                            const curr = conditions[name] || {};
                            const subjectData = dynamicSubjects[curr.subject || 'payment'];
                            const fieldData = subjectData?.fields.find(f => f.value === curr.field);
                            const ops = ALL_OPERATORS.filter(op => !fieldData?.ops || fieldData.ops.includes(op.value));

                            return (
                                <Card key={key} size="small" className="mb-2 shadow-sm"
                                      bodyStyle={{padding: '8px 12px'}}>
                                    <Row gutter={8} align="middle">
                                        <Col span={5}>
                                            <div
                                                style={{fontSize: '10px', color: '#8c8c8c', marginBottom: '2px'}}>ОБЪЕКТ
                                            </div>
                                            <Form.Item {...restField} name={[name, 'subject']} className="mb-0"
                                                       initialValue="payment">
                                                <Select
                                                    options={Object.entries(dynamicSubjects).map(([k, v]) => ({
                                                        value: k,
                                                        label: v.label
                                                    }))}
                                                    onChange={() => resetRow(name)}
                                                    suffixIcon={<FontAwesomeIcon icon={faCube} style={{
                                                        fontSize: '10px',
                                                        opacity: 0.4
                                                    }}/>}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col span={5}>
                                            <div
                                                style={{fontSize: '10px', color: '#8c8c8c', marginBottom: '2px'}}>ПОЛЕ
                                            </div>
                                            <Form.Item {...restField} name={[name, 'field']} className="mb-0"
                                                       rules={[{required: true}]}>
                                                <Select
                                                    placeholder="Поле"
                                                    options={subjectData?.fields}
                                                    onChange={() => {
                                                        form.setFieldValue(['conditions', name, 'operator'], undefined);
                                                        form.setFieldValue(['conditions', name, 'value'], undefined);
                                                    }}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col span={4}>
                                            <div style={{
                                                fontSize: '10px',
                                                color: '#8c8c8c',
                                                marginBottom: '2px'
                                            }}>УСЛОВИЕ
                                            </div>
                                            <Form.Item {...restField} name={[name, 'operator']} className="mb-0"
                                                       rules={[{required: true}]}>
                                                <Select placeholder="Оп" options={ops} disabled={!curr.field}/>
                                            </Form.Item>
                                        </Col>

                                        <Col span={9}>
                                            <div style={{
                                                fontSize: '10px',
                                                color: '#8c8c8c',
                                                marginBottom: '2px'
                                            }}>ЗНАЧЕНИЕ
                                            </div>
                                            {renderValueInput(name, name)}
                                        </Col>

                                        <Col span={1} style={{textAlign: 'right', paddingTop: '15px'}}>
                                            <Button
                                                type="text" danger size="small"
                                                icon={<FontAwesomeIcon icon={faTrashCan}/>}
                                                onClick={() => remove(name)}
                                            />
                                        </Col>
                                    </Row>
                                </Card>
                            );
                        })}
                        <Button
                            type="dashed"
                            onClick={() => add({subject: 'payment'})}
                            block
                            icon={<FontAwesomeIcon icon={faPlus}/>}
                        >
                            Добавить критерий
                        </Button>
                    </>
                )}
            </Form.List>
            <Divider orientation="left" plain className="my-4">
                <Space className="text-primary">
                    <FontAwesomeIcon icon={faClock}/>
                    <Text strong>Периоды работы</Text>
                </Space>
            </Divider>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="time_range"
                               label={<Text type="secondary" className="small">Часы работы</Text>}
                               className="mb-0">
                        <TimePicker.RangePicker format={'HH:mm'} className="w-100"/>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="working_days" label={<Text type="secondary" className="small">Дни недели</Text>}
                               className="mb-0">
                        <Select mode="multiple" placeholder="Ежедневно" options={DAYS_OF_WEEK} allowClear={true}/>
                    </Form.Item>
                </Col>
            </Row>
        </div>
    );
};

export default ConditionList;
