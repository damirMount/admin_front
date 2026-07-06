import React, { useState } from "react";
import { Button, Card, Col, DatePicker, Form, Row, Select, Segmented, Typography, Divider, Space } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays, faFilter, faMagnifyingGlass, faTableCells } from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";

const { Text } = Typography;
const { RangePicker } = DatePicker;

export default function PaymentsFilterForm({ onSearch, loading, dictionaries }) {
    const [form] = Form.useForm();
    const [modes, setModes] = useState({
        dealer: "total",
        server: "total",
        service: "total",
        apparat: "total"
    });

    const handleModeChange = (dimension, value) => {
        setModes(prev => ({ ...prev, [dimension]: value }));
    };

    const handleQuickDate = (type) => {
        const range = type === "today"
            ? [dayjs().startOf("day"), dayjs().endOf("day")]
            : [dayjs().subtract(1, "day").startOf("day"), dayjs().subtract(1, "day").endOf("day")];

        form.setFieldsValue({ date_range: range });
    };

    const handleSubmit = (values) => {
        const payload = {
            date_range: values.date_range,
            payments_status: values.payments_status,
            dealer_id: modes.dealer === "filter" ? values.dealer_select_id : modes.dealer,
            server_id: modes.server === "filter" ? values.server_select_id : modes.server,
            service_id: modes.service === "filter" ? values.service_select_id : modes.service,
            apparat_id: modes.apparat === "filter" ? values.apparat_select_id : modes.apparat,
        };
        onSearch(payload, modes);
    };

    const handleReset = () => {
        form.resetFields();
        setModes({ dealer: "total", server: "total", service: "total", apparat: "total" });
    };

    const modeOptions = [
        { label: "Сводно", value: "total" },
        { label: "Строки", value: "all" },
        { label: "Фильтр", value: "filter" }
    ];

    const renderDimensionRow = (label, dimensionKey, dictionaryItems = []) => {
        const isFilterActive = modes[dimensionKey] === "filter";

        return (
            <Row gutter={[16, 8]} align="middle" className="mb-2 pb-2 border-bottom border-light">
                <Col xs={24} md={6}>
                    <Text strong>{label}</Text>
                </Col>
                <Col xs={24} md={10}>
                    <Segmented
                        options={modeOptions}
                        value={modes[dimensionKey]}
                        onChange={(val) => handleModeChange(dimensionKey, val)}
                        block
                    />
                </Col>
                <Col xs={24} md={8}>
                    {isFilterActive ? (
                        <Form.Item name={`${dimensionKey}_select_id`} className="mb-0" rules={[{ required: true, message: 'Выберите элемент' }]}>
                            <Select
                                showSearch
                                placeholder={`Выберите ${label.toLowerCase()}...`}
                                optionFilterProp="label"
                                loading={!dictionaryItems.length}
                                options={dictionaryItems.map(item => ({
                                    label: `${item.id} | ${item.name}`,
                                    value: Number(item.id)
                                }))}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    ) : (
                        <Text type="secondary" className="small">
                            {modes[dimensionKey] === "total" ? "✦ Сумма в одну строку" : "☰ Развернуть в строки"}
                        </Text>
                    )}
                </Col>
            </Row>
        );
    };

    return (
        <Card className="mb-4 shadow-sm border-0 rounded-4">
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    date_range: [dayjs().startOf("day"), dayjs().endOf("day")],
                    payments_status: undefined
                }}
            >
                <div className="mb-3 d-flex align-items-center gap-2 text-muted small uppercase fw-bold">
                    <FontAwesomeIcon icon={faFilter} className="text-primary" />
                    <span>1. Ограничение данных</span>
                </div>

                <Row gutter={[24, 16]} className="mb-4">
                    <Col xs={24} md={8}>
                        <div className="d-flex justify-content-between align-items-end mb-2">
                            <Text strong><FontAwesomeIcon icon={faCalendarDays} className="me-2 text-primary" /> Период</Text>
                            <Space split={<Divider type="vertical" />} size={0}>
                                <Button type="link" size="small" onClick={() => handleQuickDate("today")}>Сегодня</Button>
                                <Button type="link" size="small" onClick={() => handleQuickDate("yesterday")}>Вчера</Button>
                            </Space>
                        </div>
                        <Form.Item name="date_range" className="mb-0">
                            <RangePicker style={{ width: "100%" }} className="rounded-3" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <div className="mb-2"><Text strong>Статус платежей</Text></div>
                        <Form.Item name="payments_status" className="mb-0">
                            <Select placeholder="Все статусы" allowClear>
                                <Select.Option value="success">Успешные</Select.Option>
                                <Select.Option value="fail">Ошибочные</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Divider className="my-4" />

                <div className="mb-4 d-flex align-items-center gap-2 text-muted small uppercase fw-bold">
                    <FontAwesomeIcon icon={faTableCells} className="text-primary" />
                    <span>2. Настройка структуры (Куб)</span>
                </div>

                <div className="px-2">
                    {renderDimensionRow("Дилеры", "dealer", dictionaries?.dealers || [])}
                    {renderDimensionRow("Серверы", "server", dictionaries?.servers || [])}
                    {renderDimensionRow("Сервисы", "service", dictionaries?.services || [])}
                    {renderDimensionRow("Аппараты", "apparat", dictionaries?.apparats || [])}
                </div>

                <Row className="mt-4 pt-3 border-top">
                    <Col span={24} className="d-flex justify-content-end gap-2">
                        <Button type="text" onClick={handleReset}>Сбросить</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<FontAwesomeIcon icon={faMagnifyingGlass} />}
                            loading={loading}
                            className="px-4 rounded-3"
                            style={{ backgroundColor: "#4c3a75" }}
                        >
                            Сформировать отчет
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Card>
    );
}