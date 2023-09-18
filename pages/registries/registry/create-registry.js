import React, { useState } from 'react';
import { useRouter } from 'next/router';
import FormInput from '../../../components/FormInput';
import { parseCookies } from 'nookies';
import Navigation from '../../../components/Navigation';
import CustomSelect from '../../../components/CustomSelect';
import MultiSelectWithSearch from '../../../components/MultiSelectWithSearch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCheck,
    faTag,
    faGripVertical,
    faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import Link from 'next/link';
import SelectWithSearch from '../../../components/SelectWithSearch';
import Footer from '../../../components/Footer';
import {faTrashAlt} from "@fortawesome/free-regular-svg-icons";

library.add(faCheck, faTag, faGripVertical, faPlus);

export default function CreateRegistry() {
    const [formData, setFormData] = useState({
        name: '',
        formats: [],
        is_blocked: '',
        sqlQuery: '',
        rowsData: [
            { isActive: true, field: 'identifier', tableHeader: 'Лицевой счёт' },
            { isActive: true, field: 'real_pay', tableHeader: 'Сумма платежа' },
            { isActive: true, field: 'time_proc', tableHeader: 'Дата оплаты' },
            { isActive: false, field: 'id', tableHeader: 'Номер платежа' },
            { isActive: false, field: 'account.fio', tableHeader: 'ФИО' },
            { isActive: false, field: 'id_trans', tableHeader: 'Номер чека' },
            { isActive: false, field: 'id_apparat', tableHeader: 'ID терминала' },
        ],
    });
    const router = useRouter();

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
        console.log(formData.rowsData);
    };

    // Обработчик изменения выбранных чекбоксов
    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
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
    };

    const handleTableCheckboxChange = (index) => {
        setFormData((prevFormData) => {
            const updatedRowsData = [...prevFormData.rowsData];
            updatedRowsData[index].isActive = !updatedRowsData[index].isActive;
            return {
                ...prevFormData,
                rowsData: updatedRowsData,
            };
        });
    };

    const handleTableInputChange = (index, field, value) => {
        setFormData((prevFormData) => {
            const updatedRowsData = [...prevFormData.rowsData];
            updatedRowsData[index][field] = value;
            return {
                ...prevFormData,
                rowsData: updatedRowsData,
            };
        });
    };

    const handleAddColumn = () => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            rowsData: [
                ...prevFormData.rowsData,
                { isActive: true, field: '', tableHeader: '' },
            ],
        }));
    };

    const handleRemoveColumn = (index) => {
        setFormData((prevFormData) => {
            const updatedRowsData = [...prevFormData.rowsData];
            updatedRowsData.splice(index, 1);
            return {
                ...prevFormData,
                rowsData: updatedRowsData,
            };
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const cookies = parseCookies();
            const authToken = JSON.parse(cookies.authToken).value;
            const apiUrl = process.env.NEXT_PUBLIC_REGISTRY_CREATE_URL;

            // Отправка данных формы на API
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                console.log('Данные успешно отправлены на API');
                // Перенаправление на другую страницу после успешной отправки
                await router.push('/registries/registry/index-page');
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
            <div className="container body-container mt-5">
                <h1>Страница создания файла реестров</h1>

                <form onSubmit={handleSubmit}>
                    <div className="container d-flex">
                        <div className="container w-50">
                            <div className="form-group mt-5">
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
                                    className="input-with-padding"
                                    onSelectChange={(selectedValue) => {
                                        setFormData((prevFormData) => ({
                                            ...prevFormData,
                                            is_blocked: selectedValue,
                                        }));
                                    }}
                                    name="is_blocked"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="serverId">Сервер</label>
                                <SelectWithSearch
                                    apiUrl={`${process.env.NEXT_PUBLIC_GET_LIST_SERVERS_URL}`}
                                    required
                                    name="serverId"
                                    onSelectChange={(selectedValue) =>
                                        handleInputChange({
                                            target: { name: 'serverId', value: selectedValue },
                                        })
                                    }
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="servicesId">Сервисы</label>
                                <MultiSelectWithSearch
                                    apiUrl={`${process.env.NEXT_PUBLIC_GET_LIST_SERVICES_URL}`}
                                    required
                                    name="servicesId"
                                    multi={true}
                                    placeholder="Выберете сервис"
                                    onSelectChange={(selectedValues) =>
                                        handleInputChange({
                                            target: {
                                                name: 'servicesId',
                                                value: selectedValues,
                                            },
                                        })
                                    }
                                    defaultValue={Array.isArray(formData.servicesId)
                                        ? formData.servicesId
                                        : []}
                                />
                            </div>
                            <div className="form-group d-flex align-items-center flex-column mt-4">
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
                                        <label
                                            className={`btn ${
                                                formData.formats.includes('xlsx')
                                                    ? 'btn-purple'
                                                    : 'btn-grey'
                                            }`}
                                            htmlFor="btn-xlsx"
                                        >
                                            XLSX
                                        </label>
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
                                        <label
                                            className={`btn ${
                                                formData.formats.includes('csv')
                                                    ? 'btn-purple'
                                                    : 'btn-grey'
                                            }`}
                                            htmlFor="btn-csv"
                                        >
                                            CSV
                                        </label>
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
                                        <label
                                            className={`btn ${
                                                formData.formats.includes('dbf')
                                                    ? 'btn-purple'
                                                    : 'btn-grey'
                                            }`}
                                            htmlFor="btn-dbf"
                                        >
                                            DBF
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="container w-75">
                            <label htmlFor="name">
                                Внимание! Формат DBF имеет ограничение в названии столбцов! Можно
                                ввести максимум 10 символов на английском или же 5 на русском
                            </label>
                            <table className="table table-bordered mt-4">
                                <thead>
                                <tr>
                                    <th scope="col"></th>
                                    <th scope="col">Таблица в базе</th>
                                    <th scope="col">Название таблицы в реестре</th>
                                    <th scope="col"></th>
                                </tr>
                                </thead>
                                <tbody>
                                {formData.rowsData.map((row, index) => (
                                    <tr key={index}>
                                        <td scope="row" className="table-center table-buttons">
                                            <label>
                                                <FontAwesomeIcon
                                                    icon={faGripVertical}
                                                    size="xl"
                                                    className="me-2"
                                                />
                                            </label>
                                            <input
                                                id={row.field}
                                                className="btn-checked btn-purple ms-2"
                                                type="checkbox"
                                                checked={row.isActive}
                                                onChange={() => handleTableCheckboxChange(index)}
                                            />
                                            <label className="check" htmlFor={row.field}>
                                                {row.isActive && (
                                                    <FontAwesomeIcon
                                                        className="w-100"
                                                        icon={faCheck}
                                                        size="lg"
                                                    />
                                                )}
                                            </label>
                                        </td>
                                        <td className="fw-bold">
                                            {index < 7 ? (
                                                row.field
                                            ) : (
                                                <input
                                                    required
                                                    type="text"
                                                    className="w-100 fields-input fst-italic "
                                                    value={row.field}
                                                    onChange={(event) =>
                                                        handleTableInputChange(index, 'field', event.target.value)
                                                    }
                                                    disabled={!row.isActive}
                                                />
                                            )}
                                        </td>
                                        <td>
                                            <input
                                                required
                                                type="text"
                                                className="w-100 fields-input"
                                                value={row.tableHeader}
                                                onChange={(event) =>
                                                    handleTableInputChange(index, 'tableHeader', event.target.value)
                                                }
                                                disabled={!row.isActive}
                                            />
                                        </td>
                                        <td>
                                                <button
                                                    type="button"
                                                    className="btn btn-purple"
                                                    onClick={() => handleRemoveColumn(index)}
                                                    disabled={index < 7 || !row.isActive}
                                                >
                                                    <FontAwesomeIcon icon={faTrashAlt} size="xl" />
                                                </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            <div className="d-flex justify-content-end">
                                <button
                                    type="button"
                                    className="btn btn-purple mt-2"
                                    onClick={handleAddColumn}
                                >
                                    Добавить столбец
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="w-100 mt-5 mb-5 d-flex justify-content-center">
                        <button className="btn btn-purple me-2" type="submit">
                            Сохранить
                        </button>
                        <Link
                            href="/registries/registry/index-page"
                            className="btn btn-cancel ms-2"
                            type="button"
                        >
                            Отмена
                        </Link>
                    </div>
                </form>
            </div>
            <Footer></Footer>
        </div>
    );
}
