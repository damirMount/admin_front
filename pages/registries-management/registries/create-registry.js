import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {REGISTRY_CREATE_API} from "../../../routes/api";
import Head from "next/head";
import {useAlert} from "../../../contexts/AlertContext";
import {useSession} from "next-auth/react";
import ProtectedElement from "../../../components/main/system/ProtectedElement";
import RegistryForm from "../../../components/pages/registry/RegistryForm";
import Preloader from "../../../components/main/system/Preloader";


export default function CreateRegistry() {
    const {data: session} = useSession(); // Получаем сессию
    const [processingLoader, setProcessingLoader] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        formats: [],
        is_blocked: false,
        send_type: 1,
        server_id: '',
        services_id: [],
        fields: [],
        additional_fields:  [{ totalpayFieldName: "ИТОГО:" }],
        createdAt: '',
        updatedAt: '',
        create_author: session.user.name,
        update_author: session.user.name,

    });
    const [oldFormData, setOldFormData] = useState({
        name: '',
        formats: [],
        is_blocked: false,
        send_type: 1,
        server_id: '',
        services_id: [],
        fields: [],
        additional_fields: [{ totalpayFieldName: "ИТОГО:" }],
        createdAt: '',
        updatedAt: '',
        create_author: session.user.name,
        update_author: session.user.name,
    });
    const {openNotification} = useAlert();
    const router = useRouter();


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



            // Отправка данных формы на API
            const response = await fetch(REGISTRY_CREATE_API, {
                method: 'POST',
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
    useEffect(() => {
        console.log(formData)
    }, [formData]);

    return (
        <ProtectedElement allowedPermissions={'registry_management'}>
            <div>
                <Head>
                    <title>Создать реестр | {process.env.NEXT_PUBLIC_APP_NAME}</title>
                </Head>

                {processingLoader && <Preloader/>}
                <div className={`${processingLoader ? 'd-none' : 'd-flex'} flex-column`}>

                    <h1>Страница создания файла реестров</h1>
                    <RegistryForm
                        formData={formData}
                        oldFormData={oldFormData}
                        onDataFieldsChange={setFormData}/>
                    <div className="w-100 mt-5 mb-5 d-flex justify-content-center">
                        <button className="btn btn-purple me-2" onClick={handleSubmit}>
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
