import React, {useEffect, useMemo} from "react";
import {Badge, Button, Card, Col, DatePicker, Divider, Form, Input, Row, Select, Space, Typography} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faCalendarDays,
    faEraser,
    faFilter,
    faGears,
    faMagnifyingGlass,
    faSearch,
    faSitemap,
    faTriangleExclamation
} from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import {useRouter} from "next/router";

import {getDefaults} from "../hooks/useAntiFraudData";
import {RISK_LEVELS} from "../../../../../components/main/payments/PaymentsConstants";
import {ANTI_FRAUD_CHECK_STATUS} from "../../../../../components/pages/security/anti-fraud/constants";

const {Text} = Typography;
const {RangePicker} = DatePicker;
const {Option} = Select;

export default function FilterForm({onSearch, loading, dictionaries}) {
    const [form] = Form.useForm();
    const router = useRouter();
    const formValues = Form.useWatch([], form);

    const updateUrlWithFilters = (values) => {
        const query = {};

        Object.entries(values).forEach(
            ([key, value]) => {
                if (value === undefined || value === null || value === "") {
                    return;
                }

                if (key === "date_range" && Array.isArray(value)) {
                    query.start = value[0].toISOString();
                    query.end = value[1].toISOString();
                    return;
                }

                if (key === "score_range" && Array.isArray(value)) {
                    query.score_range = value.join(",");
                    return;
                }

                if (key === "final_action" && Array.isArray(value)) {
                    query.final_action = value.join(",");
                    return;
                }

                query[key] = value;
            }
        );

        router.push(
            {
                pathname: router.pathname,
                query: query,
            },
            undefined,
            {shallow: true}
        );
    };

    // Однократный запуск при монтировании, если есть URL параметры
    useEffect(() => {
        if (router.isReady) {
            const queryParams = router.query;

            // Преобразуем параметры URL в формат формы
            const {start, end, score_range,final_action, ...rest} = queryParams;

            const currentFilters = {
                ...rest,
                id_service: rest.id_service ? Number(rest.id_service) : undefined,
                id_region: rest.id_region ? Number(rest.id_region) : undefined,
                id_apparat: rest.id_apparat ? Number(rest.id_apparat) : undefined,
                status: rest.status !== undefined ? Number(rest.status) : undefined,
                date_range: start && end ? [dayjs(start), dayjs(end)] : undefined,
                score_range: score_range
                    ? (Array.isArray(score_range) ? score_range : score_range.split(","))
                    : undefined,
                final_action: final_action
                    ? (Array.isArray(final_action) ? final_action : final_action.split(","))
                    : undefined,
            };

            // Синхронизируем поля формы с URL (чтобы при обновлении страницы фильтры не пропали)
            form.setFieldsValue(currentFilters);

            // Выполняем поиск на основе актуального URL
            onSearch(currentFilters);
        }
    }, [router.isReady, router.query]); // Теперь следим за query

    const handleSubmit = (values) => {
        updateUrlWithFilters(values);
    };

    const isFiltersChanged = useMemo(() => {
        if (!formValues) return false;
        const defaults = getDefaults();

        // Быстрая проверка на наличие любых заполненных полей, кроме дат и скора
        const hasBaseFields = Object.entries(formValues).some(([k, v]) =>
            !["date_range", "final_action"].includes(k) && v !== undefined && v !== "" && v !== null
        );

        const currentScore = (formValues.final_action || []).sort().join(",");
        const defaultScore = (defaults.final_action || []).sort().join(",");

        return hasBaseFields || currentScore !== defaultScore;
    }, [formValues]);


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
                    <Col xs={24} md={4}>
                        <Form.Item name="id" label={renderLabel(faSearch, "ID")} className="mb-0">
                            <Input placeholder="№ транзакции" allowClear className="rounded-3"/>
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={5}>
                        <Form.Item name="identifier" label={renderLabel(faFilter, "Реквизит")} className="mb-0">
                            <Input placeholder="Телефон, карта или кошелек" allowClear className="rounded-3"/>
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={7}>
                        <Form.Item
                            name="rule"
                            label={renderLabel(faGears, "Название правила")}
                            className="mb-0"
                        >
                            <Input placeholder="Напр: лимит по платежам" allowClear className="rounded-3"/>
                        </Form.Item>
                    </Col> <Col xs={24} md={8}>
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
                            showTime={{format: "HH:mm"}}
                            format="YYYY-MM-DD HH:mm"
                            className="rounded-3"
                            disabledDate={
                                (c) => {
                                    return c && c > dayjs().endOf("day");
                                }
                            }
                        />
                    </Form.Item>
                </Col>


                    <Col xs={24} md={12}>
                        <Form.Item name="score_range" label={renderLabel(faTriangleExclamation, "Уровень риска")}
                                   className="mb-0">
                            <Select mode="multiple" placeholder="Все платежи" showSearch={false} allowClear
                                    className="rounded-3">
                                {RISK_LEVELS.map(
                                    (risk) => {
                                        return (
                                            <Option key={risk.value} value={risk.value}>
                                                <Space size={4}>
                                                    <Badge className='me-1' color={risk.color}/>
                                                    <Text>{risk.label}</Text>
                                                </Space>
                                            </Option>
                                        );
                                    }
                                )}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="final_action"
                            label={renderLabel(faSitemap, "Статус проверки платежа")}
                            className="mb-0"
                        >
                            <Select mode="multiple" showSearch={false} placeholder="Все платежи" allowClear maxTagCount={2}
                                    className="rounded-3"
                                    options={Object.entries(ANTI_FRAUD_CHECK_STATUS).map(([key, status]) => {
                                        return {
                                            value: key,
                                            label: (
                                                <Space size={4}>
                                                    <Badge color={status.color || 'green'}/>
                                                    <span className='ms-2'>{status.label}</span>
                                                </Space>
                                            )
                                        };
                                    })}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
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
                    <Col xs={24} md={12} className="d-flex justify-content-end gap-2">
                        {isFiltersChanged && (
                            <Button
                                icon={<FontAwesomeIcon icon={faEraser}/>}
                                onClick={handleReset}
                                className="rounded-3"
                            >
                                Сброс
                            </Button>
                        )}
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
