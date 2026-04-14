import {useCallback} from "react";
import {UPDATE_ANTIFRAUD_PROFILE_API} from "../../../../../routes/api";
import {now} from "moment-timezone";

const useAntiFraudProfileActions = (session, openNotification, refresh) => {

    const handleSaveProfile = useCallback(async (values, {onSuccess}) => {

        try {
            const dataToSend = {
                ...values,
                ['update_author_id']: session.user.id,
                ['operator_update_at']: now(),
            };

            const response = await fetch(`${UPDATE_ANTIFRAUD_PROFILE_API}/${values.id}`, {
                method: 'PUT',
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

    return {
        handleSaveProfile,
    };
};
export default useAntiFraudProfileActions;
