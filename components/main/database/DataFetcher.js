// DataFetcher.js

import {GET_DATA_FROM_DB_API} from "../../../routes/api";
import {parseCookies} from "nookies";

const fetchData = async (config) => {
    try {
        const cookies = parseCookies();
        const authToken = JSON.parse(cookies.authToken).value;
        const fetchDataUrl = `${GET_DATA_FROM_DB_API}`;
        const params = new URLSearchParams({
            model: config.model,                                                    //'ModelName' - REQUIRED!!!
            filters: config.searchTerm ? JSON.stringify(config.searchTerm) : undefined,   // filters = { column1: 'value', column2: '[value1, value2]', accurateSearch: true} accurateSearch: true - Включает точный поиск по всем аргументам, по стандарту false;
            attributes: config.attributes || undefined,                             // attributes = 'name,fio'
            sort: config.sort || undefined,                                         // sort = { column: name, direction: asc }
            limit: config.limit || undefined,                                       // limit = 10
            offset: config.offset || undefined,                                     // offset = 5
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
