import React, {useEffect, useMemo} from "react";
import {Badge, Button, Card, Col, DatePicker, Divider, Form, Input, Row, Select, Space, Typography} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faCalendarDays,
    faEraser,
    faFilter,
    faMagnifyingGlass,
    faSearch,
    faSitemap,
    faTriangleExclamation
} from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import {useRouter} from "next/router";
import {getDefaults} from "../hooks/useAntiFraudProfiles";
import {USERS_TRUST_STATUS} from "../../../../../components/pages/security/anti-fraud/constants";

const {Text} = Typography;
const {RangePicker} = DatePicker;

export default function FilterForm({onSearch, loading, dictionaries}) {
    const [form] = Form.useForm();
    const router = useRouter();
    const formValues = Form.useWatch([], form);

    const updateUrlWithFilters = (values) => {
        const query = {};
        Object.entries(values).forEach(([key, value]) => {
            if (!value && value !== 0) return;

            if (key === "date_range" && Array.isArray(value)) {
                query.start = value[0].toISOString();
                query.end = value[1].toISOString();
            } else if (key === "status" && Array.isArray(value)) {
                query.status = value.join(",");
            } else {
                query[key] = value;
            }
        });

        router.push({pathname: router.pathname, query}, undefined, {shallow: true});
    };

    useEffect(() => {
        if (router.isReady) {
            const {start, end, status, ...rest} = router.query;
            const currentFilters = {
                ...rest,
                id_service: rest.id_service ? Number(rest.id_service) : undefined,
                date_range: start && end ? [dayjs(start), dayjs(end)] : undefined,
                status: status ? (Array.isArray(status) ? status : status.split(",")) : undefined,
            };

            form.setFieldsValue(currentFilters);
            onSearch(currentFilters);
        }
    }, [router.isReady, router.query]);

    const isFiltersChanged = useMemo(() => {
        if (!formValues) return false;
        const defaults = getDefaults();

        // Быстрая проверка на наличие любых заполненных полей, кроме дат и скора
        const hasBaseFields = Object.entries(formValues).some(([k, v]) =>
            !["date_range", "status"].includes(k) && v !== undefined && v !== "" && v !== null
        );

        const currentScore = (formValues.status || []).sort().join(",");
        const defaultScore = (defaults.status || []).sort().join(",");

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

    const renderLabel = (icon, label) => (
        <Text strong>
            <FontAwesomeIcon icon={icon} className="me-2 text-primary"/>
            {label}
        </Text>
    );

    return (
        <Card className="mb-4 shadow-sm border-0 rounded-4">
            <Form form={form} layout="vertical" onFinish={updateUrlWithFilters} requiredMark={false}>
                <Row gutter={[24, 16]} align="bottom">
                    <Col xs={24} md={4}>
                        <Form.Item name="id" label={renderLabel(faSearch, "ID")} className="mb-0">
                            <Input placeholder="№" allowClear/>
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="identifier" label={renderLabel(faFilter, "Реквизит")} className="mb-0">
                            <Input placeholder="Телефон, карта, кошелек" allowClear/>
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

                    <Col xs={24} md={10}>
                        <Form.Item name="status" label={renderLabel(faTriangleExclamation, "Статус")}
                                   className="mb-0">
                            <Select mode="multiple" placeholder="Все статусы" allowClear maxTagCount={2}
                                    options={Object.entries(USERS_TRUST_STATUS).map(([key, status]) => {
                                        return {
                                            value: key,
                                            label: (
                                                <Space size={4}>
                                                    <Badge color={status.color || 'green'}/>
                                                    <span className='ms-2'>{status.label}</span>
                                                </Space>
                                            )
                                        };
                                    })
                                    }
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8} className="d-flex flex-column justify-content-end gap-2">
                        <div className="d-flex justify-content-between">
                            {renderLabel(faCalendarDays, "Последний платёж")}
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
                    <Col xs={24} md={6} className="d-flex justify-content-end gap-2">
                        {isFiltersChanged && (
                            <Button icon={<FontAwesomeIcon icon={faEraser}/>}
                                    onClick={() => form.setFieldsValue(getDefaults())}>
                                Сброс
                            </Button>
                        )}
                        <Button type="primary" htmlType="submit" loading={loading}
                                icon={<FontAwesomeIcon icon={faMagnifyingGlass}/>}
                                style={{backgroundColor: "#4c3a75", borderColor: "#4c3a75"}} className="px-4"
                        >
                            Найти
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Card>
    );
}
