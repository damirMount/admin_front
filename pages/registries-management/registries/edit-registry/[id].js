import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import FormInput from '../../../../components/main/input/FormInput';
import Link from 'next/link';
import RegistryFieldsTable from "../../../../components/pages/registry/RegistryFieldsTable";
import {
    REGISTRY_SHOW_API,
    REGISTRY_UPDATE_API
} from "../../../../routes/api";
import Head from "next/head";
import RegistryFileFormat from "../../../../components/pages/registry/RegistryFileFormat";
import UniversalSelect from "../../../../components/main/input/UniversalSelect";
import Preloader from "../../../../components/main/system/Preloader";
import {useAlert} from "../../../../contexts/AlertContext";
import {REGISTRY_INDEX_URL} from "../../../../routes/web";
import {useSession} from "next-auth/react";

export default function EditRegistryFile() {
    const [formData, setFormData] = useState({
        name: '',
        servicesId: '',
        serverId: '',
        tableHeaders: '',
        is_blocked: '',
        formats: [],
        sqlQuery: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const {clearAlertMessage, showAlertMessage} = useAlert();
    const router = useRouter();
    const itemId = router.query.id;
    const [registryStatus, setRegistryStatus] = useState('');
    const [getRows, setRows] = useState([]);
    const [selectedServer, setSelectedServer] = useState(null)
    const { data: session } = useSession(); // Получаем сессию
    const handleUpdateRows = (updatedRows) => {
        setRows(updatedRows); // Обновляем состояние rows в EditRegistryFile на основе данных из RegistryFieldsTable
    };
    const [createdAt, setCreatedAt] = useState('');
    const [updatedAt, setUpdatedAt] = useState('');

    const [registryName, setRegistryName] = useState('');


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

    function combineDataFromDatabase(databaseFields, databaseHeaders) {
        const combinedData = [];

        for (let i = 0; i < databaseFields.length; i++) {
            const field = databaseFields[i].trim();
            const header = databaseHeaders[i].trim();

            const existingRow = getRows.find((row) => row.field === field);

            if (existingRow) {
                existingRow.tableHeader = header;
                existingRow.isActive = true;
                combinedData.push(existingRow);
            } else {
                combinedData.push({
                    isActive: true,
                    field: field,
                    tableHeader: header,
                });
            }
        }

        getRows.forEach((row) => {
            if (!combinedData.find((item) => item.field === row.field)) {
                combinedData.push(row);
            }
        });

        return combinedData;
    }


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

            const response = await fetch(`${REGISTRY_UPDATE_API}/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.accessToken}`,
                },
                body: JSON.stringify(activeFormData),
            });

            const responseData = await response.json();
            if (response.ok) {
                showAlertMessage({type: "success", text: responseData.message});
                await router.push(REGISTRY_INDEX_URL);
            } else {
                showAlertMessage({type: "error", text: responseData.message});
            }
        } catch (error) {
            showAlertMessage({type: "error", text: error.message});
            console.error(error);
        }
    };

    useEffect(() => {
        const fetchRegistryItem = async () => {
            try {
                const response = await fetch(`${REGISTRY_SHOW_API}/${itemId}`, {
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`,
                    },
                });

                const responseData = await response.json();
                if (response.ok) {
                    setFormData((prevFormData) => ({
                        ...prevFormData,
                        name: responseData.name,
                        servicesId: responseData.services_id,
                        serverId: responseData.server_id,
                        tableHeaders: responseData.table_headers,
                        is_blocked: responseData.is_blocked,
                    }));

                    setCreatedAt(responseData.createdAt)
                    setUpdatedAt(responseData.updatedAt)
                    setRegistryStatus(responseData.is_blocked)
                    setRegistryName(responseData.name)

                    const dataFieldArray = responseData.fields.split(',').map((item) => item.trim());

                    const dataHeadersArray = responseData.table_headers.split(',').map((item) => item.trim());
                    const combinedData = combineDataFromDatabase(dataFieldArray, dataHeadersArray);
                    setRows(combinedData);

                    const selectedFormats = responseData.formats; // предположим, что это уже массив форматов
                    setFormData((prevFormData) => ({
                        ...prevFormData,
                        formats: selectedFormats,
                    }));
                } else {
                    showAlertMessage({type: "error", text: responseData.message});
                    console.error('Ошибка при загрузке данных с API');
                }
            } catch (error) {
                console.error(error);
                showAlertMessage({type: "error", text: error.message});
            } finally {
                setIsLoading(false); // Устанавливаем isLoading в false после завершения загрузки
            }
        };


        if (itemId) {
            fetchRegistryItem();
        }
    }, [itemId]);


    if (isLoading) {
        return <div>
            <Preloader/>
        </div>;
    }

    return (
        <div>
            <Head>
                <title>{registryName} | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div className=" mt-5">
                <h1>Страница редактирования файла реестров</h1>
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
                                    selectedOptions={[registryStatus]}
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
                                    selectedOptions={[formData.serverId]}
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
                                <label htmlFor="serverId">Сервисы</label>
                                <UniversalSelect
                                    key={JSON.stringify(selectedServer)}
                                    name='servicesId'
                                    placeholder="Выберете сервисы"
                                    fetchDataConfig={{
                                        model: 'Service',
                                        searchTerm: {id_bserver: selectedServer}
                                    }}
                                    selectedOptions={formData.servicesId}
                                    onSelectChange={handleSelectorChange}
                                    required
                                    isMulti
                                />
                            </div>
                            <div className="form-group d-flex align-items-center flex-column mt-3">
                                <RegistryFileFormat
                                    formData={formData}
                                    setFormData={setFormData}
                                />
                            </div>
                            <div className="mt-4">
                                <p>Дата создания: {createdAt}</p>
                                <p>Дата изменения: {updatedAt}</p>
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
                        <Link  href={REGISTRY_INDEX_URL} className="btn btn-cancel ms-2" type="button">
                            Отмена
                        </Link>
                    </div>
                </form>
            </div>
           
        </div>
    );
}
