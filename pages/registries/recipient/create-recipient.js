import React, {useState} from 'react';
import {useRouter} from 'next/router';
import FormInput from '../../../components/main/input/FormInput';
import {parseCookies} from 'nookies';
import {faEnvelope, faXmarkCircle} from '@fortawesome/free-regular-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import Footer from '../../../components/main/Footer';
import {RECIPIENT_CREATE_URL} from '../../../routes/api'
import Head from "next/head";
import UniversalSelect from "../../../components/main/input/UniversalSelect";

export default function CreateRecipient() {
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        is_blocked: '',
        registry_ids: '',
        emails: [''], // Начнем с одного поля по умолчанию
    });
    const router = useRouter();

    const recipientTypes = [
        {value: '1', label: 'Ежедневный'},
        {value: '2', label: 'Еженедельный'},
        {value: '3', label: 'Ежемесячный'},
        {value: '4', label: 'Ежегодный'},
    ];

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
        console.log(valuesArray)
    };

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
                await router.push('/registries/recipient/index-page');
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
                        <UniversalSelect
                            name='type'
                            placeholder="Выберете тип реестра"
                            onSelectChange={handleSelectorChange}
                            firstOptionSelected
                            required
                            isSearchable={false}
                            options={recipientTypes}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="registry_ids">Файлы реестров</label>

                        <UniversalSelect
                            name='registry_ids'
                            placeholder="Выберете файлы реестров"
                            onSelectChange={handleSelectorChange}
                            required
                            isMulti
                            isSearchable={false}
                            fetchDataConfig={{
                                model: 'Registry',
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="is_blocked">Статус отправки письма</label>
                        <UniversalSelect
                            name='is_blocked'
                            placeholder="Укажите статус реестра"
                            onSelectChange={handleSelectorChange}
                            firstOptionSelected
                            required
                            isSearchable={false}
                            options={[
                                {value: false, label: 'Отправка письма активна'},
                                {value: true, label: 'Отправка письма отключена'},
                            ]}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="emails">Email</label>
                        <div className="d-flex flex-row flex-wrap justify-content-between">
                            {formData.emails.map((email, index) => (
                                <div key={index} className="form-group d-flex w-50">
                                    <FontAwesomeIcon className="input-icon" icon={faEnvelope} size="lg"/>
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
                                        className="btn input-btn-close"
                                        onClick={() => handleRemoveEmailInput(index)}
                                    >
                                        <FontAwesomeIcon icon={faXmarkCircle} size="lg"/>
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
            <Footer/>
        </div>
    );
}
