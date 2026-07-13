import React, { useState } from "react";
import { Button, Card, Checkbox, Col, DatePicker, Divider, Form, Modal, Row, Segmented, Select, Space, Typography } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays, faCoins, faFilter, faMagnifyingGlass, faTableCells } from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import "dayjs/locale/ru"; // Импортируем русскую локаль, если нужно, чтобы недели начинались с понедельника
import MoneyColumn from "../../../../components/main/system/MoneyColumn";

// Установка локали для корректного начала недели с понедельника
dayjs.locale("ru");

const { Text } = Typography;
const { RangePicker } = DatePicker;

export default function PaymentsFilterForm({ onSearch, loading, dictionaries, totalSummary }) {
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

    // Обновленная логика для точных календарных периодов
    const handleQuickDate = (type) => {
        let range;
        const now = dayjs();

        switch (type) {
            case "yesterday":
                range = [now.subtract(1, "day").startOf("day"), now.subtract(1, "day").endOf("day")];
                break;
            case "week":
                // Прошлая полная календарная неделя (с пн по вс)
                // subtract(1, 'week') перемещает нас в прошлую неделю,
                // затем startOf('week') и endOf('week') задают границы
                range = [now.subtract(1, "week").startOf("week"), now.subtract(1, "week").endOf("week")];
                break;
            case "month":
                // Весь предыдущий календарный месяц (с 1-го по последнее число)
                range = [now.subtract(1, "month").startOf("month"), now.subtract(1, "month").endOf("month")];
                break;
            default:
                range = [now.subtract(1, "day").startOf("day"), now.subtract(1, "day").endOf("day")];
        }

        form.setFieldsValue({ date_range: range });
    };

    const disabledDate = (current) => {
        return current && current >= dayjs().startOf("day");
    };

    const handleSubmit = (values) => {
        const payload = {
            date_range: values.date_range,
            payments_status: values.payments_status,
            actualize_data: !!values.actualize_data,
            apparat_type: values.apparat_type,
            dealer_id: modes.dealer === "filter" ? values.dealer_select_id : modes.dealer,
            server_id: modes.server === "filter" ? values.server_select_id : modes.server,
            service_id: modes.service === "filter" ? values.service_select_id : modes.service,
            apparat_id: modes.apparat === "filter" ? values.apparat_select_id : modes.apparat,
        };

        if (values.actualize_data) {
            Modal.confirm({
                title: "Внимание: Пересчет данных!",
                content: "Вы выбрали актуализацию данных. Это приведет к полному пересчету всего отчета за указанный период. Процесс может занять значительное время. Продолжить?",
                okText: "Да, запустить пересчет",
                cancelText: "Отмена",
                okButtonProps: {
                    style: { backgroundColor: "#4c3a75", borderColor: "#4c3a75" }
                },
                onOk: () => {
                    onSearch(payload, modes);
                }
            });
        } else {
            onSearch(payload, modes);
        }
    };

    const handleReset = () => {
        form.resetFields();
        setModes({ dealer: "total", server: "total", service: "total", apparat: "total" });
    };

    const modeOptions = [
        { label: "Сводно", value: "total" },
        { label: "Подробно", value: "all" },
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
                        <Form.Item name={`${dimensionKey}_select_id`} className="mb-0"
                                   rules={[{ required: true, message: 'Выберите элемент' }]}>
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
                    date_range: [dayjs().subtract(1, "day").startOf("day"), dayjs().subtract(1, "day").endOf("day")],
                    payments_status: undefined,
                    apparat_type: undefined,
                    actualize_data: false
                }}
            >
                <div className="mb-3 d-flex align-items-center gap-2 text-muted small uppercase fw-bold">
                    <FontAwesomeIcon icon={faFilter} className="text-primary" />
                    <span>1. Ограничение данных</span>
                </div>

                <Row gutter={[24, 16]} className="mb-4 align-items-end">
                    <Col xs={24} md={8}>
                        <div className="d-flex justify-content-between align-items-end mb-2">
                            <Text strong><FontAwesomeIcon icon={faCalendarDays}
                                                          className="me-2 text-primary text-nowrap" /> Период</Text>
                            <Space split={<Divider type="vertical" />} size={1}>
                                <Button type="link" size="small" onClick={() => handleQuickDate("month")}>Прош. месяц</Button>
                                <Button type="link" size="small" onClick={() => handleQuickDate("week")}>Прош. неделя</Button>
                                <Button type="link" size="small" onClick={() => handleQuickDate("yesterday")}>Вчера</Button>
                            </Space>
                        </div>
                        <Form.Item name="date_range" className="mb-0">
                            <RangePicker
                                style={{ width: "100%" }}
                                className="rounded-3"
                                disabledDate={disabledDate}
                                maxDate={dayjs().endOf('day')}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={4}>
                        <div className="mb-2"><Text strong>Статус платежей</Text></div>
                        <Form.Item name="payments_status" className="mb-0">
                            <Select placeholder="Все статусы" allowClear>
                                <Select.Option value={undefined}>Все статусы</Select.Option>
                                <Select.Option value="success">Успешные</Select.Option>
                                <Select.Option value="fail">Ошибочные</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={4}>
                        <div className="mb-2"><Text strong>Тип аппарата</Text></div>
                        <Form.Item name="apparat_type" className="mb-0">
                            <Select placeholder="Все статусы" allowClear>
                                <Select.Option value={undefined}>Все аппараты</Select.Option>
                                <Select.Option value="1">Терминал</Select.Option>
                                <Select.Option value="101">API точка</Select.Option>
                                <Select.Option value="100">Суб.точка</Select.Option>
                                <Select.Option value="2">Кассир</Select.Option>
                                <Select.Option value="3">Java/POS-Кассир</Select.Option>
                                <Select.Option value="5">SMS точка</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="actualize_data" valuePropName="checked" className="mb-1">
                            <Checkbox>
                                <Text strong>Актуализировать данные</Text>
                            </Checkbox>
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

                <Row className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center">

                    <div className="d-flex justify-content-between align-items-center w-50 text-nowrap">
                        <MoneyColumn label="Кол-во платежей" value={totalSummary.all.count} prefix={''} />
                        <Divider type="vertical" className="finance-divider" />
                        <MoneyColumn label="Внесено" value={totalSummary.all.total} />
                        <Divider type="vertical" className="finance-divider" />
                        <MoneyColumn label="Проведено" value={totalSummary.all.real_pay} color="#52c41a" />
                        <Divider type="vertical" className="finance-divider" />
                        <MoneyColumn label="Комиссия" value={totalSummary.all.commission} />
                        <Divider type="vertical" className="finance-divider" />
                        <MoneyColumn label="В инстр. валюте" value={totalSummary.all.real_pay_rur}
                                     prefix={<FontAwesomeIcon icon={faCoins} />} />
                    </div>

                    <Row className="d-flex justify-content-end gap-2">
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
                    </Row>
                </Row>
            </Form>
        </Card>
    );
}
