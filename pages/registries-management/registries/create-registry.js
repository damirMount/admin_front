import React, {useState} from 'react';
import {useRouter} from 'next/router';
import FormInput from '../../../components/main/input/FormInput';
import {faCheck, faGripVertical, faPlus, faTag,} from '@fortawesome/free-solid-svg-icons';
import {library} from '@fortawesome/fontawesome-svg-core';
import Link from 'next/link';
import RegistryFieldsTable from "../../../components/pages/registry/RegistryFieldsTable";
import {REGISTRY_CREATE_API} from "../../../routes/api";
import Head from "next/head";
import RegistryFileFormat from "../../../components/pages/registry/RegistryFileFormat";
import UniversalSelect from "../../../components/main/input/UniversalSelect";
import {useAlert} from "../../../contexts/AlertContext";
import {REGISTRY_INDEX_URL} from "../../../routes/web";
import {useSession} from "next-auth/react";

library.add(faCheck, faTag, faGripVertical, faPlus);

export default function CreateRegistry() {
    const [formData, setFormData] = useState({
        name: '',
        formats: [],
        is_blocked: '',
    });
    const router = useRouter();
    const {openNotification} = useAlert();
    const [selectedServer, setSelectedServer] = useState(null)
    const {data: session} = useSession(); // Получаем сессию
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
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: valuesArray,
        }));
    };


    const handleSubmit = async (event) => {
        event.preventDefault();

        try {

            const activeRows = getRows.filter((row) => row.isActive);
            const activeFields = activeRows.map((row) => row.field);
            const activeTableHeaders = activeRows.map((row) => row.tableHeader);

            const activeFormData = {
                ...formData,
                fields: activeFields.join(', '),
                tableHeaders: activeTableHeaders.join(', '),
            };

            // Отправка данных формы на API
            const response = await fetch(REGISTRY_CREATE_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.accessToken}`,
                },
                body: JSON.stringify(activeFormData),
            });

            const responseData = await response.json();
            if (response.ok) {
                openNotification({type: "success", message: responseData.message});
                await router.push(REGISTRY_INDEX_URL);
            } else {
                openNotification({type: "error", message: responseData.message});
            }
        } catch (error) {
            openNotification({type: "error", message: error.message});
            console.error(error);
        }
    };

    return (
        <div>
            <Head>
                <title>Создать реестр | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>

            <div>
                <h1>Страница создания файла реестров</h1>

                <form onSubmit={handleSubmit}>
                    <div className="container d-flex">
                        <div className="container w-50 mt-5">
                            <FormInput
                                type="text"
                                label="Название файла реестра"
                                className="input-field"
                                id="name"
                                name="name"
                                placeholder="Название"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                            <UniversalSelect
                                name='is_blocked'
                                label="Статус реестра"
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
                            <UniversalSelect
                                name='serverId'
                                label="Сервер"
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

                            <UniversalSelect
                                key={JSON.stringify(selectedServer)}
                                name='servicesId'
                                label="Сервисы"
                                placeholder="Выберете сервисы"
                                fetchDataConfig={{
                                    model: 'Service',
                                    searchTerm: {id_bserver: selectedServer}
                                }}
                                onSelectChange={handleSelectorChange}
                                required
                                isMulti
                            />
                            <RegistryFileFormat
                                formData={formData}
                                setFormData={setFormData}
                            />
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
                            href={REGISTRY_INDEX_URL}
                            className="btn btn-cancel ms-2"
                            type="button"
                        >
                            Отмена
                        </Link>
                    </div>
                </form>
            </div>

        </div>
    );
}
