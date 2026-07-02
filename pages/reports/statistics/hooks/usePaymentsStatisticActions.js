import {useCallback} from "react";
import {now} from "moment-timezone";
import {GET_PAYMENTS_STATISTIC_API, GET_STATISTICS_PAYMENTS_API} from "../../../../routes/api";

const usePaymentsStatisticActions = (session, openNotification) => {

    const getPaymentsStatistics = useCallback(async (values) => {

        console.log(values)
        try {
            const dataToSend = {
                ...values,
            };

            const response = await fetch(`${GET_STATISTICS_PAYMENTS_API}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.accessToken}`,
                },
                body: JSON.stringify(dataToSend),
            });

            const responseData = await response.json();

            if (response.ok) {
                openNotification({
                    type: "success",
                    message: responseData.message || 'Данные сохранены'
                });

                // Триггерим обновление данных в первом хуке
                // await refresh();

                // if (onSuccess) {
                //     onSuccess();
                // }
            } else {
                openNotification({
                    type: "error",
                    message: responseData.message || 'Ошибка сохранения'
                });
            }
        } catch (error) {
            openNotification({
                type: "error",
                message: 'Сетевая ошибка: ' + error.message
            });
        }
    }, [session, openNotification]);

    return {
        getPaymentsStatistics,
    };
};
export default usePaymentsStatisticActions;
