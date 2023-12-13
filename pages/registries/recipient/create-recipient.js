import React, { useState } from 'react';
import { useRouter } from 'next/router';
import FormInput from '../../../components/FormInput';
import { parseCookies } from 'nookies';
import Navigation from '../../../components/Navigation';
import CustomSelect from '../../../components/CustomSelect';
import MultiSelectWithSearch from '../../../components/MultiSelectWithSearch';
import { faEnvelope, faXmarkCircle} from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import Footer from '../../../components/Footer';
import {
    RECIPIENT_CREATE_URL,
    GET_REGISTRYS_URL} from '../../../routes/api'
import Head from "next/head";

export default function CreateRecipient() {
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        is_blocked: '',
        registry_ids: '',
        emails: [''], // Начнем с одного поля по умолчанию
    });
    const router = useRouter();

    const RecipientTypes = [
        { value: '1', label: 'Ежедневный' },
        { value: '2', label: 'Еженедельный' },
        { value: '3', label: 'Ежемесячный' },
        { value: '4', label: 'Ежегодный' },
    ];

    const handleEmailChange = (index, value) => {
        const newEmails = [...formData.emails];
        newEmails[index] = value;
        setFormData((prevFormData) => ({
            ...prevFormData,
            emails: newEmails,
        }));
    };

    const handleAddEmailInput = () => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            emails: [...prevFormData.emails, ''], // Добавляем новое пустое поле
        }));

    };

    const handleRemoveEmailInput = (index) => {
        // Проверяем, есть ли еще адреса, которые можно удалить
        if (formData.emails.length === 1) {
            return;
        }

        const newEmails = [...formData.emails];
        newEmails.splice(index, 1); // Удаляем элемент по индексу
        setFormData((prevFormData) => ({
            ...prevFormData,
            emails: newEmails,
        }));

    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const cookies = parseCookies();
            const authToken = JSON.parse(cookies.authToken).value;

            const apiUrl = RECIPIENT_CREATE_URL;

            // Формируем данные для отправки на сервер, включая данные emails
            const dataToSend = {
                ...formData,
            };

            // Отправка данных формы на API
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(dataToSend),
            });

            if (response.ok) {
                console.log('Данные успешно отправлены на API');
                // Перенаправление на другую страницу после успешной отправки
                router.push('/registries/recipient/index-page');
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
                <title>Создать получателя | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div>
                <Navigation />
            </div>
            <div className="container body-container w-50 mt-5">
                <h1>Страница создания получателя</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Получатель*</label>
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
                        <label htmlFor="name">Тип реестра*</label>
                        <CustomSelect
                            options={RecipientTypes}
                            required
                            name="type"
                            value={formData.type}
                            onSelectChange={(selectedValue) =>
                                handleInputChange({
                                    target: {
                                        name: 'type',
                                        value: selectedValue,
                                    },
                                })
                            }
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="is_blocked">Статус реестра</label>
                        <CustomSelect
                            options={[
                                { value: '0', label: 'Реестр активен' },
                                { value: '1', label: 'Реестр отключён' },
                            ]}
                            required
                            onSelectChange={(selectedValue) =>
                                setFormData((prevFormData) => ({
                                    ...prevFormData,
                                    is_blocked: selectedValue,
                                }))
                            }
                            name="is_blocked"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="registry_ids">Файлы реестров</label>

                        <MultiSelectWithSearch
                            apiUrl={`${GET_REGISTRYS_URL}`}
                            required
                            name="registry_ids"
                            placeholder="Выберете фаил для отправки"
                            multi={true}
                            onSelectChange={(selectedValues) =>
                                handleInputChange({
                                    target: {
                                        name: 'registry_ids',
                                        value: selectedValues,
                                    },
                                })
                            }
                            defaultValue={Array.isArray(formData.registry_ids) ? formData.registry_ids : []}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="emails">Email</label>
                        <div className="d-flex flex-row flex-wrap justify-content-between">
                            {formData.emails.map((email, index) => (
                                <div key={index} className="form-group d-flex w-50">
                                    <FontAwesomeIcon className="input-icon" icon={faEnvelope} size="lg" />
                                    <FormInput
                                        required
                                        type="email"
                                        className="mail-input input-with-padding"
                                        placeholder="Укажите почту"
                                        id={`email-${index}`}
                                        value={email}
                                        onChange={(e) => handleEmailChange(index, e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="btn input-btn"
                                        onClick={() => handleRemoveEmailInput(index)}
                                    >
                                        <FontAwesomeIcon icon={faXmarkCircle} size="lg" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="d-flex justify-content-center mt-3">
                            <button className="btn btn-grey" type="button" onClick={handleAddEmailInput}>
                                Добавить еще email
                            </button>
                        </div>
                    </div>
                    <div className="w-100 mt-5 mb-5 d-flex justify-content-center">
                        <button className="btn btn-purple me-2" type="submit">
                            Сохранить
                        </button>
                        <Link href="/registries/recipient/index-page" className="btn btn-cancel ms-2" type="button">
                            Отмена
                        </Link>
                    </div>
                </form>
            </div>
            <Footer />
        </div>
    );
}
