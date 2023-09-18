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
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck, faGripVertical} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import Footer from "../../../../components/Footer";

export default function EditRegistryFile() {
    const [formData, setFormData] = useState({
        name: '',
        servicesId: '',
        serverId: '',
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
        { isActive: true, field: 'identifier', tableHeader: 'Лицевой счёт' },
        { isActive: true, field: 'real_pay', tableHeader: 'Сумма платежа' },
        { isActive: true, field: 'time_proc', tableHeader: 'Дата оплаты' },
        { isActive: false, field: 'id', tableHeader: 'Номер платежа' },
        { isActive: false, field: 'account.fio', tableHeader: 'ФИО' },
        { isActive: false, field: 'id_trans', tableHeader: 'Номер чека' },
        { isActive: false, field: 'id_apparat', tableHeader: 'ID терминала' },
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
                        serverId: data.server_id,
                        tableHeaders: data.table_headers,
                        fields: data.fields,
                        is_blocked: data.is_blocked,
                        sqlQuery: data.sql_query,
                    }));

                    const updateRowsData = async () => {
                        const dataFieldArray = data.fields.split(',').map((item) => item.trim());
                        const dataHeadersArray = data.table_headers.split(',').map((item) => item.trim());

                        const combinedData = combineDataFromDatabase(dataFieldArray, dataHeadersArray, rows);

                        setRows(combinedData);
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


    const [dropIndex, setDropIndex] = useState(null);

    const [isDragging, setIsDragging] = useState(false);
    const handleDragStart = (e, index) => {
        e.dataTransfer.setData('text/plain', index);
        setIsDragging(true);

    };
    const handleDragOver = (e, index) => {
        e.preventDefault();
        setDropIndex(index); // Установите индекс строки, над которой находится курсор


    };
    const handleDrop = (e, toIndex) => {
        e.preventDefault();
        const fromIndex = e.dataTransfer.getData('text/plain');

        setIsDragging(false);
        setRows((prevRows) => {
            const updatedRows = [...prevRows];
            const [movedRow] = updatedRows.splice(fromIndex, 1);
            updatedRows.splice(toIndex, 0, movedRow);
            return updatedRows;
        });
    };

    const handleDragLeave = () => {
        setDropIndex(null); // Сбрасываем dropIndex при покидании компонента
    };

    function combineDataFromDatabase(databaseFields, databaseHeaders, rows) {
        const combinedData = [];

        // Пройдитесь по всем столбцам из базы данных и добавьте их в объединенный массив
        for (let i = 0; i < databaseFields.length; i++) {
            const field = databaseFields[i].trim();
            const header = databaseHeaders[i].trim();

            // Проверьте, есть ли такой столбец уже в массиве rows
            const existingRow = rows.find((row) => row.field === field);

            if (existingRow) {
                // Если столбец уже существует, обновите его заголовок
                existingRow.tableHeader = header;
                existingRow.isActive = true;
                combinedData.push(existingRow);
            } else {
                // Если столбец отсутствует в массиве rows, добавьте его
                combinedData.push({
                    isActive: true, // Здесь установите активность в true или false в зависимости от вашей логики
                    field: field,
                    tableHeader: header,
                });
            }
        }

        // Теперь добавьте все столбцы из массива rows, которые не были добавлены выше
        rows.forEach((row) => {
            if (!combinedData.find((item) => item.field === row.field)) {
                combinedData.push(row);
            }
        });

        return combinedData;
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
                await router.push('/registry/registry/index-page');
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
            <div className="container body-container mt-5">
                <h1>Страница редактирования файла реестров</h1>
                <form onSubmit={handleSubmit}>
                    <div className="container d-flex">
                        <div className="container w-50">

                    <div className="form-group">
                        <label htmlFor="name">Название файла реестра*</label>
                        <FormInput
                            type="text"
                            className="input-field"
                            id="name"
                            name="name"
                            placeholder="Название"
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
                        <label htmlFor="serverId">Сервер</label>
                        <SelectWithSearch apiUrl={`${process.env.NEXT_PUBLIC_GET_LIST_SERVERS_URL}`} required
                                          name="serverId"
                                          defaultValue={formData.serverId ? formData.serverId : []}
                                          onSelectChange={(selectedValue) =>
                                              handleInputChange({
                                                  target: {
                                                          name: 'serverId',
                                                          value: selectedValue
                                                      }})
                                          }/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="serverId">Сервисы</label>
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



                            <div className="form-group d-flex align-items-center flex-column">
                                <div className="d-flex justify-content-evenly w-75">
                                    <div>
                                        <input
                                            autoComplete="off"
                                            id="btn-xlsx"
                                            className="btn-checked btn-grey"
                                            type="checkbox"
                                            name="xlsx"
                                            checked={formData.formats.includes('xlsx')}
                                            onChange={handleCheckboxChange}
                                        />
                                        <label className={`btn ${formData.formats.includes('xlsx') ? 'btn-purple' : 'btn-grey'}`} htmlFor="btn-xlsx">XLSX</label>


                                    </div>
                                    <div>
                                        <input
                                            autoComplete="off"
                                            id="btn-csv"
                                            className="btn-checked btn-grey"
                                            type="checkbox"
                                            name="csv"
                                            checked={formData.formats.includes('csv')}
                                            onChange={handleCheckboxChange}
                                        />
                                        <label className={`btn ${formData.formats.includes('csv') ? 'btn-purple' : 'btn-grey'}`} htmlFor="btn-csv">CSV</label>
                                    </div>
                                    <div>
                                        <input
                                            autoComplete="off"
                                            id="btn-dbf"
                                            className="btn-checked btn-grey"
                                            type="checkbox"
                                            name="dbf"
                                            checked={formData.formats.includes('dbf')}
                                            onChange={handleCheckboxChange}
                                        />
                                        <label className={`btn ${formData.formats.includes('dbf') ? 'btn-purple' : 'btn-grey'}`} htmlFor="btn-dbf">DBF</label>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="container w-75">
                            <label htmlFor="name">Внимание! Формат DBF имеет ограничение в названии столбцов! Можно ввести максимум 10 символов на Английском или же 5 на Русском</label>
                            <table className="table table-bordered mt-4">
                        <thead>
                        <tr>
                            <th scope="col"></th>
                            <th scope="col">Таблица в базе</th>
                            <th scope="col">Название таблицы в реестре</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows.map((row, index) => (
                            <tr key={index}
                                draggable="true"
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOver(e, index, 'before')}
                                onDrop={(e) => handleDrop(e, index)}
                                onDragLeave={handleDragLeave}
                                className={isDragging ? 'active' : ''}
                                style={{ borderBottom: dropIndex === index ? '2px solid #532C59' : '' }}
                            >
                                <td scope="row" className="table-center table-buttons">
                                    <label>
                                        <FontAwesomeIcon icon={faGripVertical} size="xl" className="me-2"/>
                                    </label>
                                    <input
                                        id={row.field}
                                        type="checkbox"
                                        className="btn-checked btn-purple"
                                        checked={row.isActive}
                                        onChange={() => handleTableCheckboxChange(index)}
                                    />
                                    <label className="check"  htmlFor={row.field}>
                                        {row.isActive && <FontAwesomeIcon className="w-100" icon={faCheck} size="lg" />}
                                    </label>
                                </td>
                                <td className="fw-bold">
                                    {row.field}
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="w-100 fields-input"
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
                    </div>
                    </div>
                    <div className="w-100 mt-5 mb-5 d-flex justify-content-center">
                        <button className="btn btn-purple me-2" type="submit">Сохранить</button>
                        <Link href="/registry/registry/index-page" className="btn btn-cancel ms-2" type="button">Отмена</Link>
                    </div>
                </form>
            </div>
            <Footer></Footer>
        </div>

    );
}
