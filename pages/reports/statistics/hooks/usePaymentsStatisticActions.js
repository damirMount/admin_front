import { useCallback } from "react";
import { GET_STATISTICS_PAYMENTS_API } from "../../../../routes/api";

const usePaymentsStatisticActions = (session, openNotification) => {

    const getPaymentsStatistics = useCallback(async (formValues) => {
        try {
            const {
                date_range,
                payments_status,
                dealer_id,
                service_id,
                server_id,
                apparat_id,
                apparat_type,
                actualize_data // Достаем наш флаг пересчета
            } = formValues;

            // Форматируем даты для бэкенда
            const formattedDates = date_range && date_range.length === 2
                ? [date_range[0].format("YYYY-MM-DD"), date_range[1].format("YYYY-MM-DD")]
                : [];

            // Собираем тело запроса под кубическую структуру
            const dataToSend = {
                date_range: formattedDates,
                actualize_data: !!actualize_data, // Передаем на бэкенд (true / false)
                filters: {
                    payments_status: payments_status || undefined,
                    dealer_id: dealer_id ?? "total",
                    service_id: service_id ?? "total",
                    server_id: server_id ?? "total",
                    apparat_id: apparat_id ?? "total",
                    apparat_type: apparat_type ?? "total"
                }
            };

            console.log("Отправка фильтров куба:", dataToSend);

            const response = await fetch(`${GET_STATISTICS_PAYMENTS_API}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify(dataToSend),
            });

            const responseData = await response.json();

            if (response.ok) {
                return responseData.data || [];
            } else {
                openNotification({
                    type: "error",
                    message: responseData.message || 'Ошибка получения статистики'
                });
                return [];
            }
        } catch (error) {
            openNotification({
                type: "error",
                message: 'Сетевая ошибка: ' + error.message
            });
            return [];
        }
    }, [session, openNotification]);

    return {
        getPaymentsStatistics,
    };
};

export default usePaymentsStatisticActions;