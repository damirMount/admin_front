import {useCallback} from "react";
import {
    ANTIFRAUD_RULE_CREATE_API,
    ANTIFRAUD_RULE_UPDATE_API,
    ANTIFRAUD_RULES_UPDATE_ORDER_API,
    ANTIFRAUD_SETTINGS_UPDATE_API
} from "../../../../../routes/api";
import {getCleanedConditions} from "../utils/dataTransformers";

const useAntiFraudActions = (session, openNotification, refresh) => {

    /**
     * Создание или обновление правила
     */
    const handleSaveRule = useCallback(async (values, {onSuccess}) => {
        const isUpdate = Boolean(values.id);
        const apiUrl = isUpdate
            ? `${ANTIFRAUD_RULE_UPDATE_API}/${values.id}`
            : ANTIFRAUD_RULE_CREATE_API;

        try {
            const rawConditions = values.params?.conditions || [];
            const cleanedConditions = getCleanedConditions(rawConditions);

            const dataToSend = {
                ...values,
                params: {
                    ...values.params,
                    conditions: cleanedConditions
                },
                [isUpdate ? 'update_author_id' : 'create_author_id']: session.user.id,
            };

            const response = await fetch(apiUrl, {
                method: isUpdate ? 'PUT' : 'POST',
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

                await refresh();

                if (onSuccess) {
                    onSuccess();
                }
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
    }, [session, openNotification, refresh]);

    /**
     * Массовое обновление приоритетов (сортировки)
     */
    const handleSaveRulesOrder = useCallback(async (sortedIds) => {
        try {
            const response = await fetch(`${ANTIFRAUD_RULES_UPDATE_ORDER_API}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.accessToken}`,
                },
                body: JSON.stringify({ids: sortedIds}),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Ошибка при сохранении порядка');
            }
        } catch (error) {
            openNotification({
                type: 'error',
                message: error.message
            });
            throw error;
        }
    }, [session, openNotification]);

    /**
     * МЕТОД СОХРАНЕНИЯ ГЛОБАЛЬНЫХ НАСТРОЕК ПАНЕЛИ
     */
    const handleSaveSettings = useCallback(async (settings) => {
        try {
            console.log("Отправляем новые настройки панели на бэкенд:", settings);

            const response = await fetch(`${ANTIFRAUD_SETTINGS_UPDATE_API}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.accessToken}`,
                },
                body: JSON.stringify(settings),
            });

            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.message || 'Ошибка при сохранении настроек панели');
            }

            return true;
        } catch (error) {
            openNotification({
                type: 'error',
                message: error.message
            });
            throw error;
        }
    }, [session, openNotification]);

    return {
        handleSaveRule,
        handleSaveRulesOrder,
        handleSaveSettings // <-- Экспортируем новый метод
    };
};
export default useAntiFraudActions;
