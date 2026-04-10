import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import {GET_ANTIFRAUD_HISTORY_API, GET_ANTIFRAUD_PROFILE_API} from "../../../../../routes/api";
import fetchData from "../../../../../components/main/database/DataFetcher";

export const getDefaults = () => ({
    date_range: [dayjs().startOf("month"), dayjs().endOf("day")],
    score_range: ["high", "medium"],
    id: undefined,
    identifier: undefined,
    status: undefined
});

const buildQueryParams = (values) => {
    const params = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => {
        if (!value && value !== 0) return;

        if (key === "date_range" && Array.isArray(value)) {
            params.append("date_from", value[0].format("YYYY-MM-DD HH:mm:ss"));
            params.append("date_to", value[1].format("YYYY-MM-DD HH:mm:ss"));
        } else {
            params.append(key, Array.isArray(value) ? value.join(",") : value);
        }
    });
    return params.toString();
};

function useAntiFraudProfiles(session, openNotification) {
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dictionaries, setDictionaries] = useState({ services: [], apparats: [] });

    const getHistory = useCallback(async (values = {}) => {
        if (!session?.accessToken) return;

        setLoading(true);
        try {
            const response = await fetch(`${GET_ANTIFRAUD_PROFILE_API}?${buildQueryParams(values)}`, {
                headers: { Authorization: `Bearer ${session.accessToken}` }
            });
            const result = await response.json();

            if (response.ok) {
                setHistoryData(result.data || []);
            } else {
                throw new Error(result.message || "Ошибка загрузки");
            }
        } catch (error) {
            setHistoryData([]);
            openNotification({ type: "error", message: error.message });
        } finally {
            setLoading(false);
        }
    }, [session, openNotification]);

    useEffect(() => {
        if (!session?.accessToken || dictionaries.services.length > 0) return;

        const models = ["Service", "Apparat"];
        Promise.all(models.map(model => fetchData({ model }, session)))
            .then(results => {
                setDictionaries({
                    services: results[0]?.data || [],
                    apparats: results[1]?.data || [],
                });
            })
            .catch(e => console.error("Ошибка словарей:", e));
    }, [session, dictionaries.services.length]);

    return { historyData, loading, dictionaries, getHistory };
}

export default useAntiFraudProfiles;
