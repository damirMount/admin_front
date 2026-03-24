import {useCallback} from "react";
import {ANTIFRAUD_RULE_CREATE_API, ANTIFRAUD_RULE_UPDATE_API} from "../../../../../routes/api";
import {getCleanedConditions} from "../utils/dataTransformers";

export const useAntiFraudActions = (session, openNotification, refresh) => {

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

    return {
        handleSaveRule
    };
};
