import {useCallback} from "react";
import {
    ANTIFRAUD_RULE_CREATE_API,
    ANTIFRAUD_RULE_UPDATE_API,
    ANTIFRAUD_RULES_UPDATE_ORDER_API
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

                // Триггерим обновление данных в первом хуке
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
     * Сюда можно добавить удаление (handleDeleteRule)
     * или быстрое переключение статуса (toggleRuleStatus)
     */

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

            // Обновляем данные на странице после успешного сохранения
            await refresh();
        } catch (error) {
            openNotification({
                type: 'error',
                message: error.message
            });
            throw error; // Пробрасываем ошибку для обработки в компоненте
        }
    }, [session, openNotification, refresh]);

// Не забудьте добавить в return:
    return {
        handleSaveRule,
        handleSaveRulesOrder
    };
};
export default useAntiFraudActions;
