import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import SelectWithSearch from '../../../../components/input/SelectWithSearch';
import FormInput from '../../../../components/input/FormInput';
import { parseCookies } from 'nookies';
import Navigation from '../../../../components/main/Navigation';
import CustomSelect from '../../../../components/input/CustomSelect';
import MultiSelectWithSearch from '../../../../components/input/MultiSelectWithSearch';
import Link from 'next/link';
import Footer from '../../../../components/main/Footer';
import RegistryFieldsTable from "../../../../components/registry/RegistryFieldsTable";
import {
    GET_LIST_SERVERS_URL,
    GET_LIST_SERVICES_URL,
    REGISTRY_SHOW_URL,
    REGISTRY_UPDATE_URL
} from "../../../../routes/api";
import Head from "next/head";
import RegistryFileFormat from "../../../../components/registry/RegistryFileFormat";

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

    const router = useRouter();
    const itemId = router.query.id;

    const [getRows, setRows] = useState([
    ]);

    const handleUpdateRows = (updatedRows) => {
        setRows(updatedRows); // Обновляем состояние rows в EditRegistryFile на основе данных из RegistryFieldsTable
    };
    const [createdAt, setCreatedAt] = useState('');
    const [updatedAt, setUpdatedAt] = useState('');

    const [registryName, setRegistryName] = useState('');


    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
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
            const cookies = parseCookies();
            const authToken = JSON.parse(cookies.authToken).value;
            const apiUrl = REGISTRY_UPDATE_URL + '/' + itemId;

            const activeRows = getRows.filter((row) => row.isActive);
            const activeFields = activeRows.map((row) => row.field);
            const activeTableHeaders = activeRows.map((row) => row.tableHeader);

            const activeFormData = {
                ...formData,
                fields: activeFields.join(', '),
                tableHeaders: activeTableHeaders.join(', '),
            };

            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(activeFormData),
            });

            if (response.ok) {
                console.log('Данные успешно отправлены на API');
                await router.push('/registries/registry/index-page');
            } else {
                console.error('Ошибка при отправке данных на API');
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const fetchRegistryItem = async () => {
            try {
                const cookies = parseCookies();
                const authToken = JSON.parse(cookies.authToken).value;
                const apiUrl = REGISTRY_SHOW_URL + '/' + itemId;
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
                        is_blocked: data.is_blocked,
                    }));

                    setCreatedAt(data.createdAt)
                    setUpdatedAt(data.updatedAt)

                    setRegistryName(data.name)

                    const dataFieldArray = data.fields.split(',').map((item) => item.trim());

                    const dataHeadersArray = data.table_headers.split(',').map((item) => item.trim());
                    const combinedData = combineDataFromDatabase(dataFieldArray, dataHeadersArray);
                    setRows(combinedData);

                    const selectedFormats = data.formats; // предположим, что это уже массив форматов
                    setFormData((prevFormData) => ({
                        ...prevFormData,
                        formats: selectedFormats,
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


    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Head>
                <title>{registryName} | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div>
                <Navigation />
            </div>
            <div className="container body-container mt-5">
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
                                <CustomSelect
                                    options={[
                                        { value: '0', label: 'Файл реестра активен' },
                                        { value: '1', label: 'Файл реестра отключён' },
                                    ]}
                                    required
                                    defaultValue={
                                        formData.is_blocked
                                            ? { value: '1', label: 'Файл реестра отключён' }
                                            : { value: '0', label: 'Файл реестра активен' }
                                    }
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
                                    apiUrl={`${GET_LIST_SERVERS_URL}`}
                                    required
                                    name="serverId"
                                    defaultValue={formData.serverId ? formData.serverId : []}
                                    onSelectChange={(selectedValue) =>
                                        handleInputChange({
                                            target: {
                                                name: 'serverId',
                                                value: selectedValue,
                                            },
                                        })
                                    }
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="serverId">Сервисы</label>
                                <MultiSelectWithSearch
                                    apiUrl={`${GET_LIST_SERVICES_URL}`}
                                    required
                                    name="servicesId"
                                    multi={true}
                                    onSelectChange={(selectedValues) =>
                                        handleInputChange({
                                            target: {
                                                name: 'servicesId',
                                                value: selectedValues,
                                            },
                                        })
                                    }
                                    defaultValue={Array.isArray(formData.servicesId) ? formData.servicesId : []}
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
                        <Link href="/registries/registry/index-page" className="btn btn-cancel ms-2" type="button">
                            Отмена
                        </Link>
                    </div>
                </form>
            </div>
            <Footer />
        </div>
    );
}
