import React, { useEffect, useMemo } from "react";
import {Badge, Button, Card, Col, Form, Input, Row, Select, Space, theme, Typography} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEraser, faFilter, faMagnifyingGlass, faSearch, faSitemap, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { getDefaults } from "../hooks/useAntiFraudProfiles";
import { RISK_LEVELS } from "../../../../../components/main/payments/PaymentsConstants";

const { Text } = Typography;

export default function FilterForm({ onSearch, loading, dictionaries }) {
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
            } else if (key === "score_range" && Array.isArray(value)) {
                query.score_range = value.join(",");
            } else {
                query[key] = value;
            }
        });

        router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
    };

    useEffect(() => {
        if (router.isReady) {
            const { start, end, score_range, ...rest } = router.query;
            const currentFilters = {
                ...rest,
                id_service: rest.id_service ? Number(rest.id_service) : undefined,
                status: rest.status !== undefined ? Number(rest.status) : undefined,
                date_range: start && end ? [dayjs(start), dayjs(end)] : undefined,
                score_range: score_range ? (Array.isArray(score_range) ? score_range : score_range.split(",")) : undefined,
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
            !["date_range", "score_range"].includes(k) && v !== undefined && v !== "" && v !== null
        );

        const currentScore = (formValues.score_range || []).sort().join(",");
        const defaultScore = (defaults.score_range || []).sort().join(",");

        return hasBaseFields || currentScore !== defaultScore;
    }, [formValues]);

    const renderLabel = (icon, label) => (
        <Text strong>
            <FontAwesomeIcon icon={icon} className="me-2 text-primary" />
            {label}
        </Text>
    );

    return (
        <Card className="mb-4 shadow-sm border-0 rounded-4">
            <Form form={form} layout="vertical" onFinish={updateUrlWithFilters} requiredMark={false}>
                <Row gutter={[24, 16]} align="bottom">
                    <Col xs={24} md={4}>
                        <Form.Item name="id" label={renderLabel(faSearch, "ID")} className="mb-0">
                            <Input placeholder="№" allowClear />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="identifier" label={renderLabel(faFilter, "Реквизит")} className="mb-0">
                            <Input placeholder="Телефон, карта, кошелек" allowClear />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                        <Form.Item name="id_service" label={renderLabel(faSitemap, "Сервис")} className="mb-0">
                            <Select showSearch placeholder="Все сервисы" allowClear
                                    options={dictionaries.services.map(s => ({ label: s.name, value: s.id }))}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item name="score_range" label={renderLabel(faTriangleExclamation, "Статус")} className="mb-0">
                            <Select mode="multiple" placeholder="Все статусы" allowClear
                                    options={RISK_LEVELS.map(r => ({
                                        value: r.value,
                                        label: (
                                            <Space size={4}>
                                                <Badge color={r.color} /> {r.label}
                                            </Space>
                                        )
                                    }))}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} className="d-flex justify-content-end gap-2">
                        {isFiltersChanged && (
                            <Button icon={<FontAwesomeIcon icon={faEraser} />} onClick={() => form.setFieldsValue(getDefaults())}>
                                Сброс
                            </Button>
                        )}
                        <Button type="primary" htmlType="submit" loading={loading} icon={<FontAwesomeIcon icon={faMagnifyingGlass} />}
                                style={{ backgroundColor: "#4c3a75", borderColor: "#4c3a75" }} className="px-4"
                        >
                            Найти
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Card>
    );
}
