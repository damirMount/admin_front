import React, {useState} from 'react';
import {useRouter} from 'next/router';
import FormInput from '../../../../components/main/input/FormInput';
import Link from 'next/link';
import {PERMISSION_CREATE_API} from '../../../../routes/api'
import {PERMISSION_INDEX_URL} from "../../../../routes/web";
import Head from "next/head";
import {useAlert} from "../../../../contexts/AlertContext";
import {useSession} from "next-auth/react";
import FormTextArea from "../../../../components/main/input/FormTextArea";

export default function CreatePermission() {
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        description: '',
    });
    const router = useRouter();
    const {openNotification} = useAlert();
    const {data: session} = useSession(); // Получаем сессию

    const handleInputChange = (event) => {
        const {name, value} = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {

            // Формируем данные для отправки на сервер, включая данные emails
            const dataToSend = {
                ...formData,
            };

            // Отправка данных формы на API
            const response = await fetch(PERMISSION_CREATE_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.accessToken}`,
                },
                body: JSON.stringify(dataToSend),
            });

            const responseData = await response.json();
            if (response.ok) {
                openNotification({type: "success", message: responseData.message});
                await router.push(PERMISSION_INDEX_URL);
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
                <title>Создать разрешение для роли | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div>
                <h1>Создать разрешение для роли</h1>
                <form onSubmit={handleSubmit}>
                    <div className="container d-flex">
                        <div className="container w-50 mt-2">
                            <FormInput
                                input="input"
                                type="text"
                                label="Название"
                                className="input-field"
                                id="name"
                                placeholder="Название"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                            <FormInput
                                input="input"
                                type="text"
                                label="Заголовок"
                                className="input-field"
                                id="title"
                                placeholder="Заголовок"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                            />
                            <FormTextArea
                                textArea={true}
                                className="input-field"
                                label="Описание"
                                id="description"
                                placeholder="Описание"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                            />
                            <div className="w-100 mt-5 mb-5 d-flex justify-content-center">
                                <button className="btn btn-purple me-2" type="submit">
                                    Сохранить
                                </button>
                                <Link href={PERMISSION_INDEX_URL} className="btn btn-cancel ms-2" type="button">
                                    Отмена
                                </Link>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
