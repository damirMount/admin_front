import React, {useEffect, useMemo, useState, useRef} from "react";
import Head from "next/head";
import {Button, Card, Form, Space, Typography} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faShieldHalved} from "@fortawesome/free-solid-svg-icons";
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
import AntiFraudStatsDashboard from "./components/AntiFraudStatsDashboard/AntiFraudStatsDashboard";
import {useAuth} from "../../../../contexts/AccessContext";
import AntiFraudControlPanel from "./components/AntiFraudControlPanel/AntiFraudControlPanel";

const {Title} = Typography;

export default function AntiFraudRulesPage() {
    const {openNotification, openConfirmAction, closeConfirmAction} = useAlert();
    const {data: session} = useSession();
    const [form] = Form.useForm();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [filterServiceId, setFilterServiceId] = useState(null);

    // Флаг, контролирующий состояние видимости окна подтверждения
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    // --- СТЕЙТЫ НАСТРОЕК ПАНЕЛИ УПРАВЛЕНИЯ ---
    const [serverSettings, setServerSettings] = useState({ isSystemActive: null, systemMode: null, checkCoverage: null });
    const [localSettings, setLocalSettings] = useState({ isSystemActive: null, systemMode: null, checkCoverage: null });

    const [localRules, setLocalRules] = useState([]);
    const {checkAccess} = useAuth();
    const [canOperate, setCanOperate] = useState(false);

    useEffect(() => {
        const verifyAccess = async () => {
            if (session) {
                const hasAccess = await checkAccess('antifraud_managment', false);
                setCanOperate(hasAccess);
            }
        };
        verifyAccess();
    }, [session, checkAccess]);

    // Достаем актуальный settings из нашего хука данных
    const {
        rules,
        settings,
        serviceTypes,
        dealersList,
        apparatsList,
        servicesList,
        loading,
        refresh
    } = useAntiFraudData(session, openNotification);

    const {
        handleSaveRule,
        handleSaveRulesOrder,
        handleSaveSettings
    } = useAntiFraudActions(session, openNotification, refresh);

    // Синхронизация правил при их обновлении с бэкенда
    useEffect(() => {
        if (rules) {
            setLocalRules(rules);
        }
    }, [rules]);

    // СИНХРОНИЗАЦИЯ НАСТРОЕК ИЗ БАЗЫ ДАННЫХ
    useEffect(() => {
        if (settings) {
            setServerSettings(settings);
            setLocalSettings(settings);
        }
    }, [settings]);

    const serviceMap = useMemo(() => {
        const map = {};
        serviceTypes.forEach((s) => {
            map[s.id] = s.name;
        });
        return map;
    }, [serviceTypes]);

    const filteredRules = useMemo(() => {
        const source = localRules.length > 0 ? localRules : rules;
        if (!filterServiceId) {
            return source;
        }
        return source.filter((r) => {
            const isGlobal = r.service_types_ids.length === 0;
            const isSpecific = r.service_types_ids.includes(Number(filterServiceId));
            return isGlobal || isSpecific;
        });
    }, [filterServiceId, rules, localRules]);

    const columns = getTableColumns({
        form,
        setIsModalOpen,
        setOpenDropdownId,
        openDropdownId,
        canOperate
    });

    // --- ДЕКЛАРАТИВНОЕ ВЫЧИСЛЕНИЕ ИЗМЕНЕНИЙ ---
    const hasChanges = useMemo(() => {
        if (!rules || rules.length === 0) return false;

        const isOrderChanged = JSON.stringify(localRules.map(r => r.id)) !== JSON.stringify(rules.map(r => r.id));
        const isSettingsChanged = JSON.stringify(localSettings) !== JSON.stringify(serverSettings);

        return isOrderChanged || isSettingsChanged;
    }, [localRules, localSettings, rules, serverSettings]);


    // --- ЕДИНЫЙ ОБРАБОТЧИК СОХРАНЕНИЯ ВСЕХ ИЗМЕНЕНИЙ НА СТРАНИЦЕ ---
    const handleGlobalSave = async () => {
        try {
            const isOrderChanged = JSON.stringify(localRules.map(r => r.id)) !== JSON.stringify(rules.map(r => r.id));
            const isSettingsChanged = JSON.stringify(localSettings) !== JSON.stringify(serverSettings);

            if (isOrderChanged) {
                const newOrderIds = localRules.map((item) => item.id);
                await handleSaveRulesOrder(newOrderIds);
            }

            if (isSettingsChanged) {
                const payload = {
                    // Отправляем как числа/строки и как booleans одновременно для универсальности
                    is_system_active: localSettings.isSystemActive ? 1 : 0,
                    system_mode: localSettings.systemMode,
                    check_coverage: Number(localSettings.checkCoverage),

                    // Дублируем в camelCase на случай если бэк принимает его
                    isSystemActive: localSettings.isSystemActive,
                    systemMode: localSettings.systemMode,
                    checkCoverage: localSettings.checkCoverage
                };

                await handleSaveSettings(payload);
                setServerSettings(localSettings);
            }

            openNotification({
                type: 'success',
                message: 'Изменения успешно сохранены',
            });

            closeConfirmAction();
            setIsConfirmOpen(false);
            refresh();
        } catch (error) {
            openNotification({
                type: 'error',
                message: 'Ошибка при сохранении изменений',
            });
        }
    };

    // --- ЕДИНЫЙ СБРОС ВСЕХ ИЗМЕНЕНИЙ НА СТРАНИЦЕ ---
    const handleGlobalReset = () => {
        setLocalRules(rules || []);
        setLocalSettings(serverSettings);
        closeConfirmAction();
        setIsConfirmOpen(false);
    };

    // --- ИСПОЛЬЗУЕМ REFS ДЛЯ ОБХОДА ЗАМЫКАНИЙ В AlertContext ---
    const saveRef = useRef(handleGlobalSave);
    const resetRef = useRef(handleGlobalReset);

    useEffect(() => {
        saveRef.current = handleGlobalSave;
        resetRef.current = handleGlobalReset;
    });

    // --- АВТОМАТИЧЕСКАЯ СИНХРОНИЗАЦИЯ ОКНА ПОДТВЕРЖДЕНИЯ С НАЛИЧИЕМ ИЗМЕНЕНИЙ ---
    useEffect(() => {
        if (hasChanges && !isConfirmOpen) {
            openConfirmAction({
                onSave: () => saveRef.current(),
                onReset: () => resetRef.current()
            });
            setIsConfirmOpen(true);
        }
        else if (!hasChanges && isConfirmOpen) {
            closeConfirmAction();
            setIsConfirmOpen(false);
        }
    }, [hasChanges, isConfirmOpen]);


    const handleUpdateOrder = (reorderedFilteredData) => {
        const currentFullList = [...localRules];
        let filterIdx = 0;
        const nextFullList = currentFullList.map((item) => {
            const isPartofFilter = reorderedFilteredData.some(f => f.id === item.id);
            if (isPartofFilter) {
                return reorderedFilteredData[filterIdx++];
            }
            return item;
        });

        setLocalRules(nextFullList);
    };

    const handleSettingsChange = (type, value) => {
        setLocalSettings((prev) => {
            const nextSettings = { ...prev };
            if (type === 'status') nextSettings.isSystemActive = value;
            if (type === 'mode') nextSettings.systemMode = value;
            if (type === 'coverage') nextSettings.checkCoverage = value;
            return nextSettings;
        });
    };

    const renderExpandableContent = (record) => {
        return <RuleCard record={record} serviceMap={serviceMap}/>;
    };

    return (
        <ProtectedElement allowedPermissions={'antifraud_show'}>
            <Head>
                <title>Антифрод Система</title>
            </Head>
            <div className="af-container p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <Title level={2} className="m-0">
                        <FontAwesomeIcon icon={faShieldHalved} className="me-2 text-primary"/>
                        Алгоритмы проверки
                    </Title>
                    <Space>
                        {filterServiceId && (
                            <Button danger onClick={() => setFilterServiceId(null)}>
                                Сбросить фильтр
                            </Button>
                        )}
                        {canOperate && (
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
                        )}
                    </Space>
                </div>

                <AntiFraudControlPanel
                    canOperate={canOperate}
                    loading={loading}
                    isSystemActive={localSettings.isSystemActive}
                    systemMode={localSettings.systemMode}
                    checkCoverage={localSettings.checkCoverage}
                    onSettingsChange={handleSettingsChange}
                />

                <Card className="shadow-sm border-0 mb-5" bodyStyle={{padding: 0}}>
                    <SmartTable
                        data={filteredRules}
                        sortableRows={canOperate}
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

                <AntiFraudStatsDashboard session={session}/>

                <RuleFormModal
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
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
