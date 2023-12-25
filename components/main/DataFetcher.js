// DataFetcher.js

import { GET_DATA_FROM_DB_URL } from "../../routes/api";
import { parseCookies } from "nookies";

const fetchData = async (model, filters, attributes, sort, limit, offset, setAlertMessage) => {
    try {
        const cookies = parseCookies();
        const authToken = JSON.parse(cookies.authToken).value;
        const fetchDataUrl = `${GET_DATA_FROM_DB_URL}`;


        const params = new URLSearchParams({
            model: model, //'ModelName' - REQUIRED!!!
            filters: filters ? JSON.stringify(filters) : undefined,    // const filters = {column1: 'value', column2: 'value'};
            attributes: attributes || undefined,
            sort: sort || undefined,
            limit: limit || undefined,
            offset: offset || undefined,
        });

        const response = await fetch(`${fetchDataUrl}?${params.toString()}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${authToken}`
            },
        });

        const data = await response.json();

        // Проверяем, есть ли у ответа свойство error
        if (data && data.error) {
            throw new Error(data.error);
        }

        return data;
    } catch (error) {
        console.error('Ошибка при получении данных:', error);

        // Устанавливаем сообщение об ошибке в состояние
        setAlertMessage({ type: "error", text: 'Ошибка при получении данных: ' + error.message });

        return null;
    }
};

export default fetchData;
