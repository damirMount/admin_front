import React, {useEffect, useState} from 'react';
import FormInput from '../../../../../components/main/input/FormInput';
import Link from 'next/link';
import {
    PERMISSION_SHOW_API, PERMISSION_UPDATE_API
} from '../../../../../routes/api'
import {PERMISSION_INDEX_URL} from "../../../../../routes/web";
import Head from "next/head";
import FormTextArea from "../../../../../components/main/input/FormTextArea";
import {useAlert} from "../../../../../contexts/AlertContext";
import {useSession} from "next-auth/react";
import {useRouter} from "next/router";
import Preloader from "../../../../../components/main/system/Preloader";

export default function UpdatePermission() {
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        description: '',
    });
    const router = useRouter();
    const {openNotification} = useAlert();
    const {data: session} = useSession(); // Получаем сессию
    const itemId = router.query.id;
    const [isLoading, setIsLoading] = useState(true);
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
            const dataToSend = {
                ...formData,
                emails: formData.emails,
            };

            const response = await fetch(`${PERMISSION_UPDATE_API}/${itemId}`, {
                method: 'PUT',
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

    useEffect(() => {
        const fetchPermissionItem = async () => {
            try {
                const response = await fetch(`${PERMISSION_SHOW_API}/${itemId}`, {
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`,
                    },
                });
                const responseData = await response.json();
                if (response.ok) {
                    setFormData((prevFormData) => ({
                        ...prevFormData,
                        name: responseData.name,
                        title: responseData.title,
                        description: responseData.description,
                    }));
                    // setCreatedAt(responseData.createdAt)
                    // setUpdatedAt(responseData.updatedAt)

                } else {
                    openNotification({type: "error", message: responseData.message});
                    console.error('Ошибка при загрузке данных с API');
                }
            } catch (error) {
                console.error(error);
                openNotification({type: "error", message: error.message});
            } finally {
                setIsLoading(false);
            }
        };

        if (itemId) {
            fetchPermissionItem();
        }
    }, [itemId]);

    if (isLoading) {
        return <div> <Preloader/> </div>;
    }

    return (
        <div>
            <Head>
                <title>Редактировать разрешение для роли | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div>
                <h1>Редактировать разрешение для роли</h1>
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
