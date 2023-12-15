import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import FormInput from '../../../../components/input/FormInput';
import { parseCookies } from 'nookies';
import Navigation from '../../../../components/main/Navigation';
import CustomSelect from '../../../../components/input/CustomSelect';
import MultiSelectWithSearch from '../../../../components/input/MultiSelectWithSearch';
import {faEnvelope, faXmarkCircle} from "@fortawesome/free-regular-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Link from "next/link";
import Footer from "../../../../components/main/Footer";
import {GET_REGISTRIES_URL, RECIPIENT_SHOW_URL, RECIPIENT_UPDATE_URL} from "../../../../routes/api";
import Head from "next/head";

export default function EditRecipient() {
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        emails: [''], // Начнем с одного поля по умолчанию
        is_blocked: '',
        registry_ids: '',
        createdAt: '',
        updatedAt: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    // const [selectedRegistryIds, setSelectedRegistryIds] = useState([]);
    const [createdAt, setCreatedAt] = useState('');
    const [updatedAt, setUpdatedAt] = useState('');
    const [recipientName, setRecipientName] = useState('');

    const router = useRouter();
    const itemId = router.query.id;

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
            const apiUrl = `${RECIPIENT_UPDATE_URL}/${itemId}`;
            const dataToSend = {
                ...formData,
                emails: formData.emails,
            };

            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(dataToSend),
            });

            if (response.ok) {
                console.log('Данные успешно отправлены на API');
                await router.push('/registries/recipient/index-page');
            } else {
                console.error('Ошибка при отправке данных на API');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const recipientTypes = [
        { value: 1, label: 'Ежедневный' },
        { value: 2, label: 'Еженедельный' },
        { value: 3, label: 'Ежемесячный' },
        { value: 4, label: 'Ежегодный' },
    ];


    const selectedTypeOption = recipientTypes.find(
        (option) => option.value === formData.type
    );

    const handleAddEmailInput = () => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            emails: [...prevFormData.emails, ''],
        }));
    };

    const handleEmailChange = (index, value) => {
        const newEmails = [...formData.emails];
        newEmails[index] = value;
        setFormData((prevFormData) => ({
            ...prevFormData,
            emails: newEmails,
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

    useEffect(() => {
        const fetchRecipientItem = async () => {
            try {
                const cookies = parseCookies();
                const authToken = JSON.parse(cookies.authToken).value;
                const apiUrl = RECIPIENT_SHOW_URL + '/' + itemId;
                const response = await fetch(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();

                    setRecipientName(data.name)
                    // setSelectedRegistryIds(data.registry_ids);
                    setFormData((prevFormData) => ({
                        ...prevFormData,
                        name: data.name,
                        type: data.type,
                        emails: data.emails.split(',').map(email => email.trim()),
                        is_blocked: data.is_blocked,
                        registry_ids: data.registry_ids.map((item) => item.id),
                    }));
                    setCreatedAt(data.createdAt)
                    setUpdatedAt(data.updatedAt)


                } else {
                    console.error('Ошибка при загрузке данных с API');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        if (itemId) {
            fetchRecipientItem();
        }
    }, [itemId]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div>

            <Head>
                <title>{recipientName} | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>

            <div>
                <Navigation />
            </div>
            <div className="container body-container mt-5">
                <h1>Редактировать получателя</h1>
                <form onSubmit={handleSubmit}>
                    <div className="container d-flex">
                        <div className="container w-50 mt-2">
                            <div className="form-group">
                                <label htmlFor="name">Получатель*</label>
                                <FormInput
                                    type="text"
                                    className="input-field"
                                    id="name"
                                    placeholder="Название"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="type">Тип реестра*</label>
                                <CustomSelect
                                    options={recipientTypes}
                                    required
                                    name="type"
                                    defaultValue={selectedTypeOption}
                                    selectedValue={selectedTypeOption}
                                    onSelectChange={(selectedValue) =>
                                        handleInputChange({ target: { name: 'type', value: selectedValue } })
                                    }
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="registry_ids">Файлы реестров</label>
                                {!isLoading && (
                                    <MultiSelectWithSearch
                                        apiUrl={`${GET_REGISTRIES_URL}`}
                                        required
                                        name="registry_ids"
                                        multi={true}
                                        onSelectChange={(selectedValues) => handleInputChange({
                                            target: {
                                                name: 'registry_ids',
                                                value: selectedValues,
                                            }
                                        })}
                                        defaultValue={Array.isArray(formData.registry_ids) ? formData.registry_ids : []}

                                    />
                                )}
                            </div>
                            <div className="form-group">
                                <label htmlFor="is_blocked">Статус реестра</label>
                                <CustomSelect
                                    options={[
                                        { value: '0', label: 'Реестр активен' },
                                        { value: '1', label: 'Реестр отключён' },
                                    ]}
                                    required
                                    defaultValue={formData.is_blocked ? { value: '1', label: 'Реестр отключён' } : { value: '0', label: 'Реестр активен' }}
                                    onSelectChange={(selectedValue) => {
                                        setFormData((prevFormData) => ({
                                            ...prevFormData,
                                            is_blocked: selectedValue,
                                        }));
                                    }}
                                    name='is_blocked'
                                />
                            </div>
                            <div>
                                <p>Дата создания: {createdAt}</p>
                                <p>Дата изменения: {updatedAt}</p>
                            </div>
                        </div>
                        <div className="form-group container w-75">
                            <label htmlFor="emails">Email</label>
                            <div className="d-flex flex-row flex-wrap justify-content-between">
                                {formData.emails.map((email, index) => (
                                    <div key={index} className="form-group d-flex w-50">
                                        <FontAwesomeIcon className='input-icon' icon={faEnvelope} size='lg' />
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
                    </div>
                    <div className="w-100 mt-5 mb-5 d-flex justify-content-center">
                        <button className="btn btn-purple me-2" type="submit">Сохранить</button>
                        <Link href="/registries/recipient/index-page" className="btn btn-cancel ms-2" type="button">Отмена</Link>
                    </div>
                </form>
            </div>
            <Footer></Footer>
        </div>
    );
}
