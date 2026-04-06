import React, {useEffect, useMemo, useState} from "react";
import Head from "next/head";
import {Button, Card, Form, Space, Typography} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import {useSession} from "next-auth/react";

import SmartTable from "../../../../components/main/table/SmartTable";
import ProtectedElement from "../../../../components/main/system/ProtectedElement";
import {useAlert} from "../../../../contexts/AlertContext";

import RuleFormModal from "./components/RuleFormModal/RuleFormModal";
import RuleCard from "./components/RuleCard/RuleCard";
import RiskAnalysisDashboard from "./components/RiskAnalysisDashboard/RiskAnalysisDashboard";
import useAntiFraudData from "./hooks/useAntiFraudData";
import useAntiFraudActions from "./hooks/useAntiFraudActions";
import getTableColumns from "./utils/columns";

const {Title} = Typography;

export default function AntiFraudRulesPage() {
    const {openNotification, openConfirmAction, closeConfirmAction} = useAlert();
    const {data: session} = useSession();
    const [form] = Form.useForm();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [filterServiceId, setFilterServiceId] = useState(null);

    // Стейт для хранения измененного порядка до момента сохранения
    const [localRules, setLocalRules] = useState([]);

    const {
        rules,
        serviceTypes,
        dealersList,
        apparatsList,
        servicesList,
        loading,
        refresh
    } = useAntiFraudData(session, openNotification);

    const {
        handleSaveRule,
        handleSaveRulesOrder // Предполагаем, что этот метод есть или будет добавлен
    } = useAntiFraudActions(session, openNotification, refresh);

    // Синхронизируем локальные правила при загрузке данных с сервера
    useEffect(
        () => {
            if (rules) {
                setLocalRules(rules);
            }
        },
        [rules]
    );


    const serviceMap = useMemo(
        () => {
            const map = {};
            serviceTypes.forEach((s) => {
                map[s.id] = s.name;
            });
            return map;
        },
        [serviceTypes]
    );

    const filteredRules = useMemo(
        () => {
            const source = localRules.length > 0 ? localRules : rules;
            if (!filterServiceId) {
                return source;
            }
            return source.filter((r) => {
                const isGlobal = r.service_types_ids.length === 0;
                const isSpecific = r.service_types_ids.includes(Number(filterServiceId));
                return isGlobal || isSpecific;
            });
        },
        [filterServiceId, rules, localRules]
    );

    const columns = getTableColumns({
        form,
        setIsModalOpen,
        setOpenDropdownId,
        openDropdownId,
    });

    const handleSaveNewOrder = async (finalData) =>
    {
        try
        {
            // ПРАВИЛЬНО: Берем ID, а не priority
            const newOrderIds = finalData.map(
                (item) => {
                    return item.id;
                }
            );

            console.log("Отправляем массив ID на сервер:", newOrderIds);

            await handleSaveRulesOrder(newOrderIds);

            openNotification({
                type: 'success',
                message: 'Новый порядок правил успешно сохранен',
            });

            closeConfirmAction();
            refresh();
        }
        catch (error)
        {
            openNotification({
                type: 'error',
                message: 'Ошибка при сохранении порядка',
            });
        }
    };

    const handleResetOrder = () => {
        setLocalRules(rules);
        closeConfirmAction();
    };

    const handleUpdateOrder = (reorderedFilteredData) => {
        // 1. Берем ПОЛНЫЙ список правил из текущего стейта (или из props)
        const currentFullList = [...localRules];

        // 2. Создаем карту (map) новых позиций для отфильтрованных элементов
        const reorderedMap = new Map(reorderedFilteredData.map((item, index) => [item.id, item]));

        // 3. Формируем новый полный список
        // Мы заменяем старые объекты на новые в тех же местах, где они были в отфильтрованном списке
        let filterIdx = 0;
        const nextFullList = currentFullList.map((item) => {
            // Если этот элемент был в отфильтрованном списке, берем его из нового порядка
            const isPartofFilter = reorderedFilteredData.some(f => f.id === item.id);

            if (isPartofFilter) {
                return reorderedFilteredData[filterIdx++];
            }
            return item;
        });

        setLocalRules(nextFullList);

        openConfirmAction({
            onSave: () => handleSaveNewOrder(nextFullList), // Отправляем ПОЛНЫЙ список
            onReset: handleResetOrder
        });
    };
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
                        sortableRows={true}
                        onUpdateData={handleUpdateOrder}
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
