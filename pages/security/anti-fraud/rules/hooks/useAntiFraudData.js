import {useCallback, useEffect, useState} from "react";
import fetchData from "../../../../../components/main/database/DataFetcher";

export const useAntiFraudData = (session, openNotification) => {
    const [serviceTypes, setServiceTypes] = useState([]);
    const [dealersList, setDealersList] = useState([]);
    const [apparatsList, setApparatsList] = useState([]);
    const [servicesList, setServicesList] = useState([]);
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(false);

    /**
     * Основная функция загрузки
     * @param {boolean} force - если true, игнорирует наличие данных в стейте
     */
    const fetchInitialData = useCallback(async (force = false) => {
        if (!session) {
            return;
        }

        // Если данные уже есть и мы НЕ запрашивали принудительное обновление — выходим
        if (!force && rules.length > 0) {
            return;
        }

        setLoading(true);
        try {
            const [servicesTypesRes, dealersRes, apparatsRes, serviceRes, rulesRes] = await Promise.all([
                fetchData({model: 'ServiceTypes', searchTerm: {is_system: false}}, session),
                fetchData({model: 'Dealer', sort: '{"column":"id","direction":"asc"}'}, session),
                fetchData({model: 'Apparat', sort: '{"column":"id","direction":"asc"}'}, session),
                fetchData({model: 'Service', sort: '{"column":"id","direction":"asc"}'}, session),
                fetchData({model: 'AntiFraudRule', sort: '{"column":"id","direction":"desc"}'}, session)
            ]);

            if (servicesTypesRes) {
                setServiceTypes(servicesTypesRes.data);
            }
            if (dealersRes) {
                setDealersList(dealersRes.data);
            }
            if (apparatsRes) {
                setApparatsList(apparatsRes.data);
            }
            if (serviceRes) {
                setServicesList(serviceRes.data);
            }
            if (rulesRes) {
                setRules(rulesRes.data);
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

    // При монтировании компонента загружаем только если пусто
    useEffect(() => {
        fetchInitialData(false);
    }, [fetchInitialData]);

    return {
        rules,
        setRules,
        serviceTypes,
        dealersList,
        apparatsList,
        servicesList,
        loading,
        // Передаем обертку, которая всегда делает force update
        refresh: () => {
            return fetchInitialData(true);
        }
    };
};
