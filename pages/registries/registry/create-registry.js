import React, {useEffect, useState} from 'react';
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
import RegistryTable from "../../../components/RegistryTable";

library.add(faCheck, faTag, faGripVertical, faPlus);

export default function CreateRegistry() {
    const [formData, setFormData] = useState({
        name: '',
        formats: [],
        is_blocked: '',
    });
    const router = useRouter();

    const [getRows, setRows] = useState([
        { isActive: true, field: 'identifier', tableHeader: 'Лицевой счёт' },
        { isActive: true, field: 'real_pay', tableHeader: 'Сумма платежа' },
        { isActive: true, field: 'time_proc', tableHeader: 'Дата оплаты' },
        { isActive: false, field: 'id', tableHeader: 'Номер платежа' },
        { isActive: false, field: 'account.fio', tableHeader: 'ФИО' },
        { isActive: false, field: 'id_trans', tableHeader: 'Номер чека' },
        { isActive: false, field: 'id_apparat', tableHeader: 'ID терминала' },
    ]);

    const handleUpdateRows = (updatedRows) => {
        setRows(updatedRows); // Обновляем состояние rows в EditRegistryFile на основе данных из RegistryTable
    };

    const [selectedCheckboxCount, setSelectedCheckboxCount] = useState(0);

    useEffect(() => {
        setSelectedCheckboxCount(formData.formats.length);
    }, [formData.formats]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    // Обработчик изменения выбранных чекбоксов
    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setFormData((prevFormData) => {
            const formats = [...prevFormData.formats];
            if (checked && !formats.includes(name)) {
                formats.push(name);
            } else if (!checked && formats.includes(name)) {
                formats.splice(formats.indexOf(name), 1);
            }
            return {
                ...prevFormData,
                formats,
            };
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const cookies = parseCookies();
            const authToken = JSON.parse(cookies.authToken).value;
            const apiUrl = process.env.NEXT_PUBLIC_REGISTRY_CREATE_URL;

            const activeRows = getRows.filter((row) => row.isActive);
            const activeFields = activeRows.map((row) => row.field);
            const activeTableHeaders = activeRows.map((row) => row.tableHeader);

            const activeFormData = {
                ...formData,
                fields: activeFields.join(', '),
                tableHeaders: activeTableHeaders.join(', '),
            };

            // Отправка данных формы на API
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(activeFormData),
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
                                            required={selectedCheckboxCount === 0} // Делаем обязательным, если ничего не выбрано
                                        />
                                        <label
                                            className={`btn ${
                                                formData.formats.includes('xlsx') ? 'btn-purple' : 'btn-grey'
                                            }`}
                                            htmlFor="btn-xlsx">
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
                                            required={selectedCheckboxCount === 0} // Делаем обязательным, если ничего не выбрано
                                        />
                                        <label
                                            className={`btn ${
                                                formData.formats.includes('csv') ? 'btn-purple' : 'btn-grey'
                                            }`}
                                            htmlFor="btn-csv">
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
                                            required={selectedCheckboxCount === 0} // Делаем обязательным, если ничего не выбрано
                                        />
                                        <label
                                            className={`btn ${
                                                formData.formats.includes('dbf') ? 'btn-purple' : 'btn-grey'
                                            }`}
                                            htmlFor="btn-dbf">
                                            DBF
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="container w-75">
                            <RegistryTable
                                getRows={getRows}
                                onUpdateData={handleUpdateRows}
                            />
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
