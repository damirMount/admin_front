import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import SelectWithSearch from '../../../../components/SelectWithSearch';
import FormInput from '../../../../components/FormInput';
import {parseCookies} from "nookies";
import Navigation from "../../../../components/Navigation";
import FormTextarea from "../../../../components/FormTextarea";

export default function EditRegistryFile() {
    const [formData, setFormData] = useState({
        name: '',
        serviceId: '',
        serverId: '',
        tableHeaders: '',
        fields: '',
        sqlQuery: '',
    });
    const [isLoading, setIsLoading] = useState(true);


    const router = useRouter();
    const itemId = router.query.id;


    useEffect(() => {
        const fetchRegistryItem = async () => {
            try {
                const cookies = parseCookies();
                const authToken = JSON.parse(cookies.authToken).value;
                const apiUrl = process.env.NEXT_PUBLIC_REGISTRY_FILE_SHOW_URL + '/' + itemId;
                const response = await fetch(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setFormData((prevFormData) => ({
                        ...prevFormData,
                        name: data.name,
                        serviceId: data.service_id,
                        serverId: data.server_id,
                        tableHeaders: data.table_headers,
                        fields: data.fields,
                        sqlQuery: data.sql_query,
                    }));
                } else {
                    console.error('Ошибка при загрузке данных с API');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false); // Устанавливаем isLoading в false после завершения загрузки
            }
        };

        if (itemId) {
            fetchRegistryItem();
        }
    }, [itemId]);

    const handleInputChange = (event) => {
        const {name, value} = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleTextareaChange = (event) => {
        const {name, value} = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };


    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const cookies = parseCookies();
            const authToken = JSON.parse(cookies.authToken).value;
            const apiUrl = process.env.NEXT_PUBLIC_REGISTRY_FILE_UPDATE_URL + '/' + itemId;
            // Отправка данных формы на API
            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                console.log('Данные успешно отправлены на API');
                // Перенаправление на другую страницу после успешной отправки
                router.push('/update-db');
            } else {
                console.error('Ошибка при отправке данных на API');
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>; // Отображаем сообщение о загрузке пока данные не получены
    }

    return (
        <div>
            <div>
                <Navigation></Navigation>
            </div>
            <div className="container">
                <h1>Страница создания реестров</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Название файла реестра*</label>
                        <FormInput
                            type="text"
                            className="input-field"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="serviceId">Сервис</label>
                        <SelectWithSearch apiUrl={`${process.env.NEXT_PUBLIC_GET_LIST_SERVICES_URL}`} required
                                          name="serviceId"
                                          defaultValue={formData.serviceId}
                                          onSelectChange={(selectedValue) =>
                                              handleInputChange({target: {name: 'serviceId', value: selectedValue}})
                                          }/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="serverId">Сервер</label>
                        <SelectWithSearch apiUrl={`${process.env.NEXT_PUBLIC_GET_LIST_SERVERS_URL}`} required
                                          name="serverId"
                                          defaultValue={formData.serverId}
                                          onSelectChange={(selectedValue) =>
                                              handleInputChange({target: {name: 'serverId', value: selectedValue}})
                                          }/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="tableHeaders">Название столбцов в реестре*</label>
                        <FormTextarea
                            id="tableHeaders"
                            className="text-field"
                            name="tableHeaders"
                            value={formData.tableHeaders}
                            onChange={handleTextareaChange}
                            rows={6}
                            cols={60}
                            required
                        />
                        <sup>Если столбцов несколько, то перечислить их через запятую</sup>
                    </div>
                    <div className="form-group">
                        <label htmlFor="fields">Название столбцов в таблице</label>
                        <FormTextarea
                            id="fields"
                            name="fields"
                            value={formData.fields}
                            onChange={handleTextareaChange}
                            rows={6}
                            cols={60}
                            className="text-field"
                        />
                        <sup>Если столбцов несколько, то перечислить их через запятую</sup>
                    </div>
                    <div className="form-group">
                        <label htmlFor="sqlQuery">Использовать sql запрос</label>
                        <FormTextarea
                            id="sqlQuery"
                            name="sqlQuery"
                            value={formData.sqlQuery}
                            onChange={handleTextareaChange}
                            rows={4}
                            cols={60}
                            className="text-field"
                        />
                        <sup>Использовать sql запрос если не можете использовать название столбцов в таблице</sup>
                    </div>
                    <button type="submit">Сохранить</button>
                </form>

                <style jsx>{`
                  .container {
                    max-width: 500px;
                    margin: 10px auto 0;
                    padding: 2rem;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                  }

                  h1 {
                    text-align: center;
                    margin-bottom: 2rem;
                    font-family: sans-serif;
                    font-size: 1.5rem;
                  }

                  .form-group {
                    margin-bottom: 2rem;
                  }

                  label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: bold;
                    font-family: sans-serif;
                  }

                  button[type='submit'] {
                    background-color: grey;
                    color: #fff;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    cursor: pointer;
                    width: 100%;
                  }

                  button[type='submit']:hover {
                    background-color: #0069d9;
                  }
                `}</style>
            </div>
        </div>

    );
}
