// DataFetcher.js

import {GET_DATA_FROM_DB_URL} from "../../../routes/api";
import {parseCookies} from "nookies";

const fetchData = async (model, filters, attributes, sort, limit, offset) => {

    try {
        const cookies = parseCookies();
        const authToken = JSON.parse(cookies.authToken).value;
        const fetchDataUrl = `${GET_DATA_FROM_DB_URL}`;

        const params = new URLSearchParams({
            model: model,                                               //'ModelName' - REQUIRED!!!
            filters: filters ? JSON.stringify(filters) : undefined,
            // filters = { column1: 'value', column2: 'value', accurateSearch: true} accurateSearch: true - Включает точный поиск по всем аргументам, по стандарту false;
            attributes: attributes || undefined,                        // attributes = 'name,fio'
            sort: sort || undefined,                                    // sort = { column: name, direction: asc }
            limit: limit || undefined,                                  // limit = 10
            offset: offset || undefined,                                // offset = 5
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
        throw (error);
    }
};

export default fetchData;
