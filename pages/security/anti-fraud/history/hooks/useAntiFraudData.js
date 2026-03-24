import {useCallback, useEffect, useState} from "react";
import dayjs from "dayjs";
import {GET_ANTIFRAUD_HISTORY_API} from "../../../../../routes/api";
import fetchData from "../../../../../components/main/database/DataFetcher";

export const getDefaults = () => {
    return {
        date_range: [dayjs().startOf("month"), dayjs().endOf("day")],
        score_range: ["high", "medium"],
        id: undefined,
        identifier: undefined,
        status: undefined,
        id_dealer: undefined,
        id_apparat: undefined,
        minSum: undefined,
        maxSum: undefined,
        rule: undefined,
        id_region: undefined
    };
};

const buildQueryParams = (values) => {
    const params = new URLSearchParams();
    Object.entries(values).forEach(
        ([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                if (key === "date_range" && Array.isArray(value) && value.length === 2) {
                    if (dayjs.isDayjs(value[0]) && dayjs.isDayjs(value[1])) {
                        params.append("date_from", value[0].format("YYYY-MM-DD HH:mm:ss"));
                        params.append("date_to", value[1].format("YYYY-MM-DD HH:mm:ss"));
                    }
                } else if (key === "score_range" && Array.isArray(value)) {
                    params.append(key, value.join(","));
                } else {
                    params.append(key, value.toString());
                }
            }
        }
    );
    return params;
};

function useAntiFraudData(session, openNotification) {
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dictionaries, setDictionaries] = useState({
        services: [],
        dealers: [],
        apparats: [],
        servers: []
    });

    const getHistory = useCallback(
        async (values = {}) => {
            if (!session?.accessToken) {
                return;
            }

            setLoading(true);
            setHistoryData([]);

            try {
                const queryParams = buildQueryParams(values);
                const response = await fetch(`${GET_ANTIFRAUD_HISTORY_API}?${queryParams.toString()}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${session?.accessToken}`,
                        "Content-Type": "application/json"
                    }
                });

                const result = await response.json();

                if (response.ok) {
                    setHistoryData(result.data || []);
                } else {
                    setHistoryData([]);
                    openNotification({
                        type: "error",
                        message: result.message || "Ошибка загрузки"
                    });
                }
            } catch (error) {
                setHistoryData([]);
                openNotification({
                    type: "error",
                    message: "Сетевая ошибка"
                });
            } finally {
                setLoading(false);
            }
        },
        [session, openNotification]
    );

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
            } catch (e) {
                console.error("Ошибка словарей:", e);
            }
        },
        [session, dictionaries]
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
        historyData,
        loading,
        dictionaries,
        getHistory
    };
}

export default useAntiFraudData;
