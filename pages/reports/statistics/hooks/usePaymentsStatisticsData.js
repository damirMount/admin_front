import {useCallback, useEffect, useState} from "react";
import fetchData from "../../../../components/main/database/DataFetcher";
function usePaymentsStatisticsData(session, setLoading) {
    const [dictionaries, setDictionaries] = useState({
        services: [],
        dealers: [],
        apparats: [],
        servers: []
    });

    const loadDictionaries = useCallback(
        async () => {
            if (!session) {
                return;
            }

            // Проверяем, есть ли уже данные в словарях, чтобы не грузить их повторно
            if (
                dictionaries.services.length > 0 ||
                dictionaries.dealers.length > 0 ||
                dictionaries.apparats.length > 0
            ) {
                return;
            }

            const models = ["Service", "Dealer", "Apparat", "Server"];
            try {
                setLoading(true)
                const results = await Promise.all(
                    models.map(
                        (model) => {
                            return fetchData({model}, session);
                        }
                    )
                );
                setDictionaries({
                    services: results[0]?.data || [],
                    dealers: results[1]?.data || [],
                    apparats: results[2]?.data || [],
                    servers: results[3]?.data || []
                });
                setLoading(false)
            } catch (e) {
                setLoading(false)
                console.error("Ошибка словарей:", e);
            }
        },
        [dictionaries.apparats.length, dictionaries.dealers.length, dictionaries.services.length, session, setLoading]
    );

    useEffect(
        () => {
            // Загружаем только если есть сессия И данные еще не были загружены (проверка по дилерам)
            if (session?.accessToken && dictionaries.dealers.length === 0) {
                loadDictionaries();
            }
        },
        [session, loadDictionaries, dictionaries.dealers.length]
    );

    return {
        dictionaries,
    };
}

export default usePaymentsStatisticsData;
