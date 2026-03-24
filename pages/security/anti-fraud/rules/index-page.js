import React, {useState, useMemo} from "react";
import Head from "next/head";
import {Button, Card, Form, Space, Typography} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import {useSession} from "next-auth/react";

import {getTableColumns} from './utils/columns';
import SmartTable from "../../../../components/main/table/SmartTable";
import ProtectedElement from "../../../../components/main/system/ProtectedElement";
import {useAlert} from "../../../../contexts/AlertContext";

import RuleFormModal from "./components/RuleFormModal/RuleFormModal";
import RuleCard from "./components/RuleCard/RuleCard";
import RiskAnalysisDashboard from "./components/RiskAnalysisDashboard/RiskAnalysisDashboard";

import {useAntiFraudData} from "./hooks/useAntiFraudData";
import {useAntiFraudActions} from "./hooks/useAntiFraudActions";

const {Title} = Typography;

export default function AntiFraudRulesPage() {
    const {openNotification} = useAlert();
    const {data: session} = useSession();
    const [form] = Form.useForm();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [filterServiceId, setFilterServiceId] = useState(null);

    // 1. Получаем данные
    const {
        rules,
        serviceTypes,
        dealersList,
        apparatsList,
        servicesList,
        loading,
        refresh
    } = useAntiFraudData(session, openNotification);

    // 2. Получаем методы действий (передаем refresh для автообновления списка)
    const {
        handleSaveRule
    } = useAntiFraudActions(session, openNotification, refresh);

    // 3. Вычисляемые данные для UI
    const serviceMap = useMemo(() => {
        const map = {};
        serviceTypes.forEach((s) => {
            map[s.id] = s.name;
        });
        return map;
    }, [serviceTypes]);

    const filteredRules = useMemo(() => {
        if (!filterServiceId) {
            return rules;
        }
        return rules.filter((r) => {
            const isGlobal = r.service_types_ids.length === 0;
            const isSpecific = r.service_types_ids.includes(Number(filterServiceId));
            return isGlobal || isSpecific;
        });
    }, [filterServiceId, rules]);

    const columns = getTableColumns({
        form,
        setIsModalOpen,
        setOpenDropdownId,
        openDropdownId,
    });

    const renderExpandableContent = (record) => {
        return (
            <RuleCard
                record={record}
                serviceMap={serviceMap}
            />
        );
    };

    return (
        <ProtectedElement allowedPermissions={'access_management'}>
            <Head>
                <title>Антифрод Система</title>
            </Head>
            <div className="af-container p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <Title level={2} className="m-0">🛡️ Алгоритмы проверки</Title>
                    <Space>
                        {filterServiceId && (
                            <Button
                                danger
                                onClick={() => {
                                    setFilterServiceId(null);
                                }}
                            >
                                Сбросить фильтр
                            </Button>
                        )}
                        <Button
                            className="btn-purple"
                            onClick={() => {
                                form.resetFields();
                                setIsModalOpen(true);
                            }}
                            icon={<FontAwesomeIcon icon={faPlus} className="me-2"/>}
                        >
                            Создать алгоритм
                        </Button>
                    </Space>
                </div>

                <Card className="shadow-sm border-0 mb-5" bodyStyle={{padding: 0}}>
                    <SmartTable
                        data={filteredRules}
                        loading={loading}
                        size={'small'}
                        columns={columns}
                        expandableContent={renderExpandableContent}
                    />
                </Card>

                <RiskAnalysisDashboard
                    rules={rules}
                    serviceTypes={serviceTypes}
                    setFilterServiceId={setFilterServiceId}
                />

                <RuleFormModal
                    open={isModalOpen}
                    onCancel={() => {
                        setIsModalOpen(false);
                    }}
                    onFinish={(values) => {
                        handleSaveRule(values, {
                            onSuccess: () => {
                                setIsModalOpen(false);
                                form.resetFields();
                            }
                        });
                    }}
                    serviceTypes={serviceTypes}
                    dealersList={dealersList}
                    servicesList={servicesList}
                    apparatsList={apparatsList}
                    form={form}
                />
            </div>
        </ProtectedElement>
    );
}
