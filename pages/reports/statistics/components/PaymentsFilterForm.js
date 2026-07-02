import React, {useMemo} from "react";
import {Button, Card, Col, DatePicker, Divider, Form, Row, Select, Space, Typography} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCalendarDays, faMagnifyingGlass, faSitemap, faTriangleExclamation} from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import {useRouter} from "next/router";


const {Text} = Typography;
const {RangePicker} = DatePicker;
const {Option} = Select;

export default function PaymentsFilterForm({onSearch, loading, dictionaries}) {
    const [form] = Form.useForm();
    const router = useRouter();
    const formValues = Form.useWatch([], form);

    const handleSubmit = (values) => {
        onSearch(values);
    };


    const handleQuickDate = (type) => {
        const range = type === "today"
            ? [dayjs().startOf("day"), dayjs().endOf("day")]
            : [dayjs().subtract(1, "day").startOf("day"), dayjs().subtract(1, "day").endOf("day")];

        form.setFieldsValue(
            {
                date_range: range
            }
        );
    };

    const handleReset = () => {
        form.setFieldsValue(getDefaults());
    };

    const renderLabel = (icon, label) => {
        return (
            <Text strong>
                <FontAwesomeIcon icon={icon} className="me-2 text-primary"/>
                {label}
            </Text>
        );
    };

    return (
        <Card className="mb-4 shadow-sm border-0 rounded-4 overflow-hidden">
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark={false}
            >
                <Row gutter={[24, 16]} align="bottom">
                    <Col xs={24} md={8}>
                        <div className="d-flex justify-content-between mb-2">
                            {renderLabel(faCalendarDays, "Период")}
                            <Space split={<Divider type="vertical" style={{margin: "0 4px"}}/>} size={0}>
                                <Button
                                    type="link"
                                    size="small"
                                    className="p-0"
                                    onClick={() => {
                                        return handleQuickDate("today");
                                    }}
                                >
                                    Сегодня
                                </Button>
                                <Button
                                    type="link"
                                    size="small"
                                    className="p-0"
                                    onClick={() => {
                                        return handleQuickDate("yesterday");
                                    }}
                                >
                                    Вчера
                                </Button>
                            </Space>
                        </div>
                        <Form.Item name="date_range" className="mb-0">
                            <RangePicker
                                style={{width: "100%"}}
                                format="YYYY-MM-DD"
                                className="rounded-3"
                                disabledDate={
                                    (c) => {
                                        return c && c > dayjs().endOf("day");
                                    }
                                }
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="score_range" label={renderLabel(faTriangleExclamation, "Тип отчёта")}
                                   className="mb-0">
                            <Select mode="multiple" placeholder="Статус" showSearch={false} allowClear
                                    className="rounded-3">
                                {/*{RISK_LEVELS.map(*/}
                                {/*    (risk) => {*/}
                                {/*        return (*/}
                                {/*            <Option key={risk.value} value={risk.value}>*/}
                                {/*                <Space size={4}>*/}
                                {/*                    <Badge className='me-1' color={risk.color}/>*/}
                                {/*                    <Text>{risk.label}</Text>*/}
                                {/*                </Space>*/}
                                {/*            </Option>*/}
                                {/*        );*/}
                                {/*    }*/}
                                {/*)}*/}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="score_range" label={renderLabel(faTriangleExclamation, "Статус")}
                                   className="mb-0">
                            <Select mode="multiple" placeholder="Статус" showSearch={false} allowClear
                                    className="rounded-3">
                                {/*{RISK_LEVELS.map(*/}
                                {/*    (risk) => {*/}
                                {/*        return (*/}
                                {/*            <Option key={risk.value} value={risk.value}>*/}
                                {/*                <Space size={4}>*/}
                                {/*                    <Badge className='me-1' color={risk.color}/>*/}
                                {/*                    <Text>{risk.label}</Text>*/}
                                {/*                </Space>*/}
                                {/*            </Option>*/}
                                {/*        );*/}
                                {/*    }*/}
                                {/*)}*/}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={6}>
                        <Form.Item name="id_service" label={renderLabel(faSitemap, "Дилер")} className="mb-0">
                            <Select
                                showSearch
                                placeholder="Все сервисы"
                                allowClear
                                optionFilterProp="label"
                                // Важно: если данных еще нет, показываем состояние загрузки или пустой массив
                                loading={!dictionaries?.services}
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                // Формируем опции только если массив существует
                                options={useMemo(() =>
                                    (dictionaries?.services || []).map(s => ({
                                        label: `${s.id} | ${s.name}`,
                                        // Гарантируем, что value — число, чтобы соответствовать Number() из useEffect
                                        value: Number(s.id)
                                    })), [dictionaries?.services])
                                }
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Form.Item
                            name="final_action"
                            label={renderLabel(faSitemap, "Сервер")}
                            className="mb-0"
                        >
                            <Select mode="multiple" showSearch={false} placeholder="Все платежи" allowClear
                                    maxTagCount={2}
                                    className="rounded-3"
                                // options={Object.entries(ANTI_FRAUD_CHECK_STATUS).map(([key, status]) => {
                                //     return {
                                //         value: key,
                                //         label: (
                                //             <Space size={4}>
                                //                 <Badge color={status.color || 'green'}/>
                                //                 <span className='ms-2'>{status.label}</span>
                                //             </Space>
                                //         )
                                //     };
                                // })}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Form.Item name="id_service" label={renderLabel(faSitemap, "Сервис")} className="mb-0">
                            <Select
                                showSearch
                                placeholder="Все сервисы"
                                allowClear
                                optionFilterProp="label"
                                // Важно: если данных еще нет, показываем состояние загрузки или пустой массив
                                loading={!dictionaries?.services}
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                // Формируем опции только если массив существует
                                options={useMemo(() =>
                                    (dictionaries?.services || []).map(s => ({
                                        label: `${s.id} | ${s.name}`,
                                        // Гарантируем, что value — число, чтобы соответствовать Number() из useEffect
                                        value: Number(s.id)
                                    })), [dictionaries?.services])
                                }
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={6}>
                        <Form.Item name="id_service" label={renderLabel(faSitemap, "Аппарат")} className="mb-0">
                            <Select
                                showSearch
                                placeholder="Все сервисы"
                                allowClear
                                optionFilterProp="label"
                                // Важно: если данных еще нет, показываем состояние загрузки или пустой массив
                                loading={!dictionaries?.services}
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                // Формируем опции только если массив существует
                                options={useMemo(() =>
                                    (dictionaries?.services || []).map(s => ({
                                        label: `${s.id} | ${s.name}`,
                                        // Гарантируем, что value — число, чтобы соответствовать Number() из useEffect
                                        value: Number(s.id)
                                    })), [dictionaries?.services])
                                }
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={24} className="d-flex justify-content-end gap-2">
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<FontAwesomeIcon icon={faMagnifyingGlass}/>}
                            loading={loading}
                            className="rounded-3 px-4"
                            style={{backgroundColor: "#4c3a75", borderColor: "#4c3a75"}}
                        >
                            Найти
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Card>
    );
}
