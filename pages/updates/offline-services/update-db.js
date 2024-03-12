import React, {useState} from 'react';
import {useRouter} from 'next/router';
import FormInput from '../../../components/main/input/FormInput';

import {POST_ABONENT_SERVICE_API} from '../../../routes/api'
import Head from "next/head";
import {useSession} from "next-auth/react";
import UniversalSelect from "../../../components/main/input/UniversalSelect";

export default function UpdateDBPage() {
    const [formData, setFormData] = useState({
        serviceId: '',
        identifierOrder: '',
        paySumOrder: '',
        file: '',
    });
    const router = useRouter();
    const {data: session} = useSession(); // Получаем сессию
    const handleInputChange = (event) => {
        const {name, value, type, files} = event.target;

        if (type === 'file' && files.length) {
            const file = files[0];
            const reader = new FileReader();

            reader.onloadend = () => {
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    [name]: reader.result,
                }));
            };

            reader.readAsDataURL(file);
        } else {
            setFormData((prevFormData) => ({
                ...prevFormData,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch(POST_ABONENT_SERVICE_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.accessToken}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                console.log('Данные успешно отправлены на API');
                // Перенаправление на другую страницу после успешной отправки
                window.alert('Данные успешно записаны!');
                window.location.reload();
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
                <title>Обновление базы данных оффлайн сервисов | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div className="container d-flex flex-column w-50 justify-content-center">
                <h1>Обновление базы данных оффлайн сервисов</h1>
                <form className='d-flex align-items-center flex-column' onSubmit={handleSubmit}>
                    <div className='d-flex flex-column justify-content-center w-75'>
                        <div className="form-group">
                            <label htmlFor="service_id">Сервис</label>
                            <UniversalSelect
                                name='serviceId'
                                placeholder="Выберете сервис"
                                required
                                fetchDataConfig={{
                                    model: 'Service',
                                }}
                                onSelectChange={(selectedValue) =>
                                    handleInputChange({
                                        target: {name: 'serviceId', value: selectedValue},
                                    })
                                }
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="identifierOrder">Идентификатор*</label>
                            <FormInput
                                type="number"
                                id="identifierOrder"
                                name="identifierOrder"
                                value={formData.identifierOrder}
                                onChange={handleInputChange}
                                required
                                className="input-field"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="paySumOrder">Оплачиваемая сумма</label>
                            <FormInput
                                type="number"
                                id="paySumOrder"
                                name="paySumOrder"
                                value={formData.paySumOrder}
                                onChange={handleInputChange}
                                className="input-field"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="file">Выбрать файл</label>
                            <FormInput
                                type="file"
                                id="file"
                                name="file"
                                accept=".xls,.xlsx,.dbf,.txt,.csv"
                                onChange={handleInputChange}
                                required
                                className="form-control"
                            />
                        </div>
                    </div>
                    <button className="btn btn-purple mt-5" type="submit">Сохранить</button>

                </form>
            </div>

        </div>
    );
}
