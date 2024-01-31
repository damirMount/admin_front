import React, {useState} from 'react';
import {useRouter} from 'next/router';
import FormInput from '../../../components/main/input/FormInput';
import {parseCookies} from 'nookies';
import {faCheck, faGripVertical, faPlus, faTag,} from '@fortawesome/free-solid-svg-icons';
import {library} from '@fortawesome/fontawesome-svg-core';
import Link from 'next/link';
import Footer from '../../../components/main/Footer';
import RegistryFieldsTable from "../../../components/pages/registry/RegistryFieldsTable";
import {REGISTRY_CREATE_URL} from "../../../routes/api";
import Head from "next/head";
import RegistryFileFormat from "../../../components/pages/registry/RegistryFileFormat";
import UniversalSelect from "../../../components/main/input/UniversalSelect";

library.add(faCheck, faTag, faGripVertical, faPlus);

export default function CreateRegistry() {
    const [formData, setFormData] = useState({
        name: '',
        formats: [],
        is_blocked: '',
    });
    const router = useRouter();
    const [selectedServer, setSelectedServer] = useState(null)
    const [getRows, setRows] = useState([
        {isActive: true, field: 'identifier', tableHeader: 'Лицевой счёт'},
        {isActive: true, field: 'real_pay', tableHeader: 'Сумма платежа'},
        {isActive: true, field: 'time_proc', tableHeader: 'Дата оплаты'},
        {isActive: false, field: 'id', tableHeader: 'Номер платежа'},
        {isActive: false, field: 'account.fio', tableHeader: 'ФИО'},
        {isActive: false, field: 'id_trans', tableHeader: 'Номер чека'},
        {isActive: false, field: 'id_apparat', tableHeader: 'ID терминала'},
    ]);

    const handleUpdateRows = (updatedRows) => {
        setRows(updatedRows); // Обновляем состояние rows в EditRegistryFile на основе данных из RegistryFieldsTable
    };


    const handleInputChange = (event) => {
        const {name, value} = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleSelectorChange = (valuesArray, name) => {
        console.log(selectedServer)
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: valuesArray,
        }));
    };


    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const cookies = parseCookies();
            const authToken = JSON.parse(cookies.authToken).value;
            const apiUrl = REGISTRY_CREATE_URL;

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
            <Head>
                <title>Создать реестр | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div>

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
                                <UniversalSelect
                                    name='is_blocked'
                                    placeholder="Укажите статус файла реестра"
                                    onSelectChange={handleSelectorChange}
                                    firstOptionSelected
                                    required
                                    isSearchable={false}
                                    options={[
                                        {value: false, label: 'Файл реестра активен'},
                                        {value: true, label: 'Файл реестра отключён'},
                                    ]}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="serverId">Сервер</label>
                                <UniversalSelect
                                    name='serverId'
                                    placeholder="Выберете сервер"
                                    fetchDataConfig={{
                                        model: 'Server',
                                    }}
                                    onSelectChange={(selectedValue, name) => {
                                        handleSelectorChange(selectedValue, name);
                                        setSelectedServer(selectedValue);
                                    }}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="servicesId">Сервисы</label>

                                <UniversalSelect
                                    key={JSON.stringify(selectedServer)}
                                    name='servicesId'
                                        placeholder="Выберете сервисы"
                                    fetchDataConfig={{
                                        model: 'Service',
                                        searchTerm: {id_bserver: selectedServer}
                                    }}
                                    onSelectChange={handleSelectorChange}
                                    required
                                    isMulti
                                />
                            </div>
                            <div className="form-group d-flex align-items-center flex-column mt-4">
                                <RegistryFileFormat
                                    formData={formData}
                                    setFormData={setFormData}
                                />
                            </div>
                        </div>

                        <div className="container w-75">
                            <RegistryFieldsTable
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
