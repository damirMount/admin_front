import {useCallback, useEffect, useState} from "react";
import fetchData from "../../../../../components/main/database/DataFetcher";

// Выносим константу ключей наружу для удобства работы
export const ANTIFRAUD_KEYS = {
    active: 'antifraud_is_system_active',
    mode: 'antifraud_system_mode',
    checkCoverage: 'antifraud_traffic_coverage_percent'
};

const useAntiFraudData = (session, openNotification) => {
    const [serviceTypes, setServiceTypes] = useState([]);
    const [dealersList, setDealersList] = useState([]);
    const [apparatsList, setApparatsList] = useState([]);
    const [servicesList, setServicesList] = useState([]);
    const [rules, setRules] = useState([]);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchInitialData = useCallback(async (force = false) => {
        if (!session) {
            return;
        }

        if (!force && rules.length > 0) {
            return;
        }

        setLoading(true);
        try {
            const [servicesTypesRes, dealersRes, apparatsRes, serviceRes, rulesRes, settingsRes] = await Promise.all([
                fetchData({model: 'ServiceTypes', searchTerm: {is_system: false}}, session),
                fetchData({model: 'Dealer', sort: '{"column":"id","direction":"asc"}'}, session),
                fetchData({model: 'Apparat', sort: '{"column":"id","direction":"asc"}'}, session),
                fetchData({model: 'Service', sort: '{"column":"id","direction":"asc"}'}, session),
                fetchData({model: 'AntiFraudRule', sort: '{"column":"priority","direction":"asc"}'}, session),
                fetchData({model: 'SystemConfig'}, session).catch(() => null)
            ]);

            if (servicesTypesRes) setServiceTypes(servicesTypesRes.data);
            if (dealersRes) setDealersList(dealersRes.data);
            if (apparatsRes) setApparatsList(apparatsRes.data);
            if (serviceRes) setServicesList(serviceRes.data);
            if (rulesRes) setRules(rulesRes.data);

            // --- БЕЗОПАСНЫЙ УНИВЕРСАЛЬНЫЙ ПАРСИНГ SYSTEMCONFIG ---
            if (settingsRes && settingsRes.data) {
                const data = settingsRes.data;

                // Функция-помощник для поиска значения по ключу в любом формате ответа бэка
                const getConfigValue = (configKey) => {
                    if (Array.isArray(data)) {
                        // Вариант А: Массив ключ-значение [{key: 'antifraud_...', value: '...'}]
                        const foundRow = data.find(item => item.key === configKey || item.name === configKey);
                        if (foundRow) return foundRow.value;

                        // Вариант Б: Массив с одним объектом-строкой [{antifraud_...: '...'}]
                        if (data[0] && data[0][configKey] !== undefined) return data[0][configKey];
                    } else if (data && typeof data === 'object') {
                        // Вариант В: Плоский объект {antifraud_...: '...'}
                        return data[configKey];
                    }
                    return undefined;
                };

                const rawActive = getConfigValue(ANTIFRAUD_KEYS.active);
                const rawMode = getConfigValue(ANTIFRAUD_KEYS.mode);
                const rawCoverage = getConfigValue(ANTIFRAUD_KEYS.checkCoverage);

                setSettings({
                    // Кастим к строгому Boolean для Switch
                    isSystemActive: rawActive === true || rawActive === 1 || rawActive === '1' || rawActive === 'true',
                    // Строго String для Select
                    systemMode: rawMode ? String(rawMode) : 'block',
                    // Строго Number для InputNumber
                    checkCoverage: rawCoverage !== undefined && rawCoverage !== null ? Number(rawCoverage) : 5
                });
            }
        } catch (error) {
            openNotification({
                type: 'error',
                message: 'Ошибка при загрузке данных: ' + error.message
            });
        } finally {
            setLoading(false);
        }
    }, [session, openNotification, rules.length]);

    useEffect(() => {
        fetchInitialData(false);
    }, [fetchInitialData]);

    return {
        rules,
        setRules,
        settings,
        serviceTypes,
        dealersList,
        apparatsList,
        servicesList,
        loading,
        refresh: () => fetchInitialData(true)
    };
};
export default useAntiFraudData;
