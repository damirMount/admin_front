import React, {useState} from 'react';
import {useRouter} from 'next/router';
import SelectWithSearch from '../../../components/SelectWithSearch';
import FormInput from '../../../components/FormInput';
import {parseCookies} from "nookies";
import Navigation from "../../../components/Navigation";
import FormTextarea from "../../../components/FormTextarea";
import CustomSelect from "../../../components/CustomSelect";
import MultiSelectWithSearch from "../../../components/MultiSelectWithSearch";


export default function CreateRegistryFile() {
    const [formData, setFormData] = useState({
        name: '',
        formats: '',
        is_blocked: '',
        sqlQuery: '',
        rowsData: '',
    });
    const router = useRouter();

    const [rows, setRows] = useState([
        { isActive: true, field: 'identifier', tableHeader: 'Лицевой счёт' },
        { isActive: true, field: 'real_pay', tableHeader: 'Сумма платежа' },
        { isActive: false, field: 'id', tableHeader: 'Номер платежа' },
        { isActive: true, field: 'time_proc', tableHeader: 'Дата оплаты' },
        { isActive: false, field: 'account.fio', tableHeader: 'ФИО' },
    ]);


    const handleInputChange = (event) => {
        const {name, value} = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
        console.log(rows)
    };

    const handleTextareaChange = (event) => {
        const {name, value} = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    // Обработчик изменения выбранных чекбоксов
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

    const handleTableCheckboxChange = (index) => {
        setRows((prevRows) => {
            const updatedRows = [...prevRows];
            updatedRows[index].isActive = !updatedRows[index].isActive;
            return updatedRows;
        });
    };

    const handleTableInputChange = (index, field, value) => {
        setRows((prevRows) => {
            const updatedRows = [...prevRows];
            updatedRows[index][field] = value;
            return updatedRows;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const cookies = parseCookies();
            const authToken = JSON.parse(cookies.authToken).value;
            const apiUrl = process.env.NEXT_PUBLIC_REGISTRY_FILE_CREATE_URL;

            // Формируем данные для отправки на сервер, включая данные rows
            const dataToSend = {
                ...formData,
                rowsData: rows,
            };

            // Отправка данных формы на API
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(dataToSend),
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


    return (
        <div>
            <div>
                <Navigation></Navigation>
            </div>
            <div className="container">
                <h1>Страница создания файла реестров</h1>
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
                        <MultiSelectWithSearch apiUrl={`${process.env.NEXT_PUBLIC_GET_LIST_SERVERS_URL}`}
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
                        <label htmlFor="servicesId">Сервисы</label>
                        <MultiSelectWithSearch apiUrl={`${process.env.NEXT_PUBLIC_GET_LIST_SERVICES_URL}`}
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
