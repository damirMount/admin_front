import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';

import {REGISTRY_SHOW_API, REGISTRY_UPDATE_API} from "../../../../routes/api";
import Head from "next/head";
import Preloader from "../../../../components/main/system/Preloader";
import {useAlert} from "../../../../contexts/AlertContext";
import {useSession} from "next-auth/react";
import ProtectedElement from "../../../../components/main/system/ProtectedElement";
import RegistryForm from "../../../../components/pages/registry/RegistryForm";

export default function EditRegistryFile() {
    const {data: session} = useSession(); // Получаем сессию
    const [formData, setFormData] = useState({
        name: '',
        formats: [],
        is_blocked: '',
        send_type: '',
        server_id: '',
        services_id: [],
        fields: [],
        additional_fields:  [{enableTotalpayField: true,  totalpayFieldName: "ИТОГО:" }],
    });
    const [oldFormData, setOldFormData] = useState({
        name: '',
        formats: [],
        is_blocked: '',
        send_type: '',
        server_id: '',
        services_id: [],
        fields: [],
        additional_fields:  [{enableTotalpayField: true,  totalpayFieldName: "ИТОГО:" }],
    });
    const [processingLoader, setProcessingLoader] = useState(false);
    const {openNotification} = useAlert();
    const router = useRouter();
    const itemId = router.query.id;
    const [registryName, setRegistryName] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessingLoader(true)
        try {
            if (formData.name === null || formData.name === '') {
                throw new Error(`Введите название реестра`)
            }
            if (formData.formats.length === 0) {
                throw new Error('Выберете формат файла')
            }

            if (formData.server_id === null || formData.server_id === '') {
                throw new Error(`Выберете сервер`)
            }
            if (formData.send_type === 1 && formData.services_id.length <= 0) {
                throw new Error(`Выбран тип отправки реестра 'по услугам' но не одна услуга не выбрана.
                Вы должны выбрать хотя бы одну услугу`)
            }
            if (formData.fields.length <= 0) {
                throw new Error(`Таблица не может быть пуста`)
            }

            formData.create_author = formData.create_author ? formData.create_author : session.user.name
            formData.update_author = session.user.name

            const response = await fetch(`${REGISTRY_UPDATE_API}/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.accessToken}`,
                },
                body: JSON.stringify(formData),
            });

            const responseData = await response.json();

            if (response.ok) {
                setOldFormData(formData)
                openNotification({type: "success", message: responseData.message});
            } else {
                openNotification({type: "error", message: responseData.message});
            }

        } catch (error) {
            openNotification({type: "error", message: error.message});
            console.error(error);
        }
        setProcessingLoader(false)
    };

    const updateFormData = (responseData) => {
        return {
            name: responseData.name,
            services_id: responseData.services_id,
            server_id: responseData.server_id,
            is_blocked: responseData.is_blocked,
            send_type: responseData.send_type,
            formats: responseData.formats,
            fields:  responseData.fields,
            additional_fields: responseData.additional_fields,
            create_author: responseData.create_author,
            update_author: responseData.update_author,
            createdAt: responseData.createdAt,
            updatedAt: responseData.updatedAt
        };
    };

    const fetchRegistryItem = async () => {
        if(!itemId) {
            return false
        }
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
                    ...updateFormData(responseData)
                }));

                setOldFormData((prevOldFormData) => ({
                    ...prevOldFormData,
                    ...updateFormData(responseData)
                }));

                setRegistryName(responseData.name)

            } else {
                openNotification({type: "error", message: responseData.message});
                console.error('Ошибка при загрузке данных с API');
            }
        } catch (error) {
            console.error(error);
            openNotification({type: "error", message: error.message});
        }
    };

    useEffect(() => {
        console.log(formData.additional_fields.enableTotalpayField)
    }, [formData]);

    useEffect(() => {
        fetchRegistryItem();
    }, []);


    return (
        <ProtectedElement allowedPermissions={'registry_management'}>
            <div>
                <Head>
                    <title>{registryName} | {process.env.NEXT_PUBLIC_APP_NAME}</title>
                </Head>
                {processingLoader && formData && <Preloader/>}
                <div className={`${processingLoader ? 'd-none' : 'd-flex'} flex-column`} key={JSON.stringify(oldFormData)}>
                    <h1>Страница редактирования файла реестров</h1>
                    <RegistryForm
                        oldFormData={oldFormData}
                        formData={formData}
                        onDataFieldsChange={setFormData}/>
                    <div className="w-100 mt-5 mb-5 d-flex justify-content-center">
                        <button onClick={handleSubmit} className="btn btn-purple me-2" type="submit">
                            Сохранить
                        </button>
                        <button onClick={() => router.back()} className="btn btn-cancel ms-2" type="button">
                            Отмена
                        </button>
                    </div>
                </div>
            </div>
        </ProtectedElement>
    );
}
