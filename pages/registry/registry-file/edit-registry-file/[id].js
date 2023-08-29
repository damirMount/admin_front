import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import SelectWithSearch from '../../../../components/SelectWithSearch';
import FormInput from '../../../../components/FormInput';
import {parseCookies} from "nookies";
import Navigation from "../../../../components/Navigation";
import FormTextarea from "../../../../components/FormTextarea";
import CustomSelect from "../../../../components/CustomSelect";
import {log} from "util";
import MultiSelectWithSearch from "../../../../components/MultiSelectWithSearch";

export default function EditRegistryFile() {
    const [formData, setFormData] = useState({
        name: '',
        servicesId: '',
        serversId: '',
        tableHeaders: '',
        is_blocked: '',
        fields: '',
        formats: '',
        sqlQuery: '',
    });
    const [isLoading, setIsLoading] = useState(true);


    const router = useRouter();
    const itemId = router.query.id;

    const [rows, setRows] = useState([
        { isActive: false, field: 'identifier', tableHeader: 'Лицевой счёт' },
        { isActive: false, field: 'real_pay', tableHeader: 'Сумма платежа' },
        { isActive: false, field: 'id', tableHeader: 'Номер платежа' },
        { isActive: false, field: 'time_proc', tableHeader: 'Дата оплаты' },
        { isActive: false, field: 'account.fio', tableHeader: 'ФИО' },
    ]);
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
                        servicesId: data.services_id,
                        serversId: data.servers_id,
                        tableHeaders: data.table_headers,
                        fields: data.fields,
                        is_blocked: data.is_blocked,
                        sqlQuery: data.sql_query,
                    }));

                    const updateRowsData = async () => {
                        const dataFieldArray = data.fields.split(',').map(item => item.trim());
                        const dataHeadersArray = data.table_headers.split(',').map(item => item.trim());

                        const updatedRows = rows.map(row => {
                            const isActive = dataFieldArray.includes(row.field);
                            const fieldIndex = dataFieldArray.indexOf(row.field);
                            const tableHeader = fieldIndex !== -1 ? dataHeadersArray[fieldIndex] : row.tableHeader;
                            const field = fieldIndex !== -1 ? dataHeadersArray[fieldIndex] : row.field;

                            return {
                                ...row,
                                isActive: isActive,
                                fields: field,
                                tableHeader: tableHeader,
                            };
                        });

                        setRows(updatedRows);
                    };

                    updateRowsData();


                    const selectedFormats = data.formats; // предположим, что это уже массив форматов
                    setFormData((prevFormData) => ({
                        ...prevFormData,
                        formats: selectedFormats,
                    }));
                    console.log(formData.is_blocked);
                }


                else {
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

    console.log(formData)

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleTableInputChange = (index, field, value) => {
        setRows((prevRows) => {
            const updatedRows = [...prevRows];
            updatedRows[index][field] = value;
            return updatedRows;
        });

        // Обновите formData здесь
        const updatedTableHeaders = rows.map((row) => row.tableHeader).join(', ');
        setFormData((prevFormData) => ({
            ...prevFormData,
            tableHeaders: updatedTableHeaders,
        }));
    };




    const handleTextareaChange = (event) => {
        const {name, value} = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleTableCheckboxChange = (index) => {
        setRows((prevRows) => {
            const updatedRows = [...prevRows];
            updatedRows[index].isActive = !updatedRows[index].isActive;
            return updatedRows;
        });
    };

    const handleCheckboxChange = (event) => {
        const {name, checked} = event.target;
        if (checked) {
            setFormData((prevFormData) => ({
                ...prevFormData,
                formats: [...prevFormData.formats, name],
            }));
        } else {
            setFormData((prevFormData) => ({
                ...prevFormData,
                formats: prevFormData.formats.filter((type) => type !== name),
            }));
        }
    }



    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const cookies = parseCookies();
            const authToken = JSON.parse(cookies.authToken).value;
            const apiUrl = process.env.NEXT_PUBLIC_REGISTRY_FILE_UPDATE_URL + '/' + itemId;

            // Фильтруем активные строки для отправки
            const activeRows = rows.filter((row) => row.isActive);

            // Создаем объект данных для отправки, включая только активные строки
            const activeFields = activeRows.map((row) => row.field);
            const activeTableHeaders = activeRows.map((row) => row.tableHeader);

            const activeFormData = {
                ...formData,
                fields: activeFields.join(', '), // Обновляем строку полей
                tableHeaders: activeTableHeaders.join(', '), // Обновляем строку заголовков таблицы
            };

            // Отправка данных формы на API
            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(activeFormData), // Отправляем только активные строки
            });

            if (response.ok) {
                console.log('Данные успешно отправлены на API');
                // Перенаправление на другую страницу после успешной отправки
                await router.push('/registry/registry-file/index-page');
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
                <h1>Страница редактирования файла реестров</h1>
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
                        <label htmlFor="is_blocked">Статус реестра</label>
                        <CustomSelect
                            options={[
                                { value: '0', label: 'Файл реестра активен' },
                                { value: '1', label: 'Файл реестра отключён' },
                            ]}
                            required
                            defaultValue={formData.is_blocked ? { value: '1', label: 'Файл реестра отключён' } : { value: '0', label: 'Файл реестра активен' }}
                            onSelectChange={(selectedValue) => {
                                setFormData((prevFormData) => ({
                                    ...prevFormData,
                                    is_blocked: selectedValue,
                                }));
                            }}
                            name='is_blocked'
                        />

                    </div>

                    <div className="form-group">
                        <label htmlFor="serversId">Сервера</label>
                        <MultiSelectWithSearch
                            apiUrl={`${process.env.NEXT_PUBLIC_GET_LIST_SERVERS_URL}`}
                            required
                            name="serversId"
                            multi={true}
                            onSelectChange={(selectedValues) => handleInputChange({
                                target: {
                                    name: 'serversId',
                                    value: selectedValues,
                                }
                            })}
                            defaultValue={Array.isArray(formData.serversId) ? formData.serversId : []}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="serversId">Сервисы</label>
                    <MultiSelectWithSearch
                        apiUrl={`${process.env.NEXT_PUBLIC_GET_LIST_SERVICES_URL}`}
                        required
                        name="servicesId"
                        multi={true}
                        onSelectChange={(selectedValues) => handleInputChange({
                            target: {
                                name: 'servicesId',
                                value: selectedValues,
                            }
                        })}
                        defaultValue={Array.isArray(formData.servicesId) ? formData.servicesId : []}
                    />
                    </div>



                    <div className="form-group">
                        <label htmlFor="sqlQuery">Использовать sql запрос</label>
                        <FormTextarea
                            id="sqlQuery"
                            name="sqlQuery"
                            value={formData.sql}
                            onChange={handleTextareaChange}
                            rows={4}
                            cols={60}
                            className="text-field"
                        />
                        <sup>Использовать sql запрос если не можете использовать название столбцов в таблице</sup>
                    </div>
                    <div className="form-group">
                        <label>Формат реестра*:</label>
                        <div>
                            <label>
                                <input
                                    type="checkbox"
                                    name="xlsx"
                                    checked={formData.formats.includes('xlsx')}
                                    onChange={handleCheckboxChange}
                                />
                                XLSX
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="checkbox"
                                    name="csv"
                                    checked={formData.formats.includes('csv')}
                                    onChange={handleCheckboxChange}
                                />
                                CSV
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="checkbox"
                                    name="dbf"
                                    checked={formData.formats.includes('dbf')}
                                    onChange={handleCheckboxChange}
                                />
                                DBF
                            </label>
                        </div>
                    </div>


                    <table>
                        <thead>
                        <tr>
                            <th></th>
                            <th>Таблица в базе</th>
                            <th>Название таблицы в реестре</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows.map((row, index) => (
                            <tr key={index}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={row.isActive}
                                        onChange={() => handleTableCheckboxChange(index)}
                                    />
                                </td>
                                <td>
                                    {row.field}
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={row.tableHeader}
                                        onChange={(event) =>
                                            handleTableInputChange(index, 'tableHeader', event.target.value)
                                        }
                                        disabled={!row.isActive}
                                    />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
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
