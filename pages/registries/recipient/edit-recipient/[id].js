import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import FormInput from '../../../../components/main/input/FormInput';
import {parseCookies} from 'nookies';
import {faEnvelope, faXmarkCircle} from "@fortawesome/free-regular-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Link from "next/link";
import Footer from "../../../../components/main/Footer";
import {RECIPIENT_SHOW_API, RECIPIENT_UPDATE_API} from "../../../../routes/api";
import Head from "next/head";
import UniversalSelect from "../../../../components/main/input/UniversalSelect";
import Preloader from "../../../../components/main/Preloader";

export default function EditRecipient() {
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        emails: [], // Начнем с одного поля по умолчанию
        is_blocked: '',
        registry_ids: '',
        createdAt: '',
        updatedAt: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [createdAt, setCreatedAt] = useState('');
    const [updatedAt, setUpdatedAt] = useState('');
    const [recipientName, setRecipientName] = useState('');

    const router = useRouter();
    const itemId = router.query.id;

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
            const cookies = parseCookies();
            const authToken = JSON.parse(cookies.authToken).value;
            const apiUrl = `${RECIPIENT_UPDATE_API}/${itemId}`;
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
        {value: 1, label: 'Каждый день'},
        {value: 2, label: 'Раз в неделю'},
        {value: 3, label: 'Раз в месяц'},
        {value: 4, label: 'Раз в год'},
    ];


    const handleSelectorChange = (valuesArray, name) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: valuesArray,
        }));
    };

    useEffect(() => {
        const fetchRecipientItem = async () => {
            try {
                const cookies = parseCookies();
                const authToken = JSON.parse(cookies.authToken).value;
                const apiUrl = RECIPIENT_SHOW_API + '/' + itemId;
                const response = await fetch(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();

                    setRecipientName(data.name)
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
        return <div>
            <Preloader/>
        </div>;
    }

    return (
        <div>

            <Head>
                <title>{recipientName} | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>

            <div className=" mt-5">
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
                            <div className="form-group d-flex justify-content-between align-items-center">
                                <div className="form-group w-50">
                                    <label htmlFor="name">Период отправки реестра</label>
                                    <UniversalSelect
                                        name='type'
                                        placeholder="Выберете период"
                                        onSelectChange={handleSelectorChange}
                                        firstOptionSelected
                                        selectedOptions={[formData.type]}
                                        required
                                        isSearchable={false}
                                        options={recipientTypes}
                                    />
                                </div>
                                <div className="form-group   text-nowrap">
                                    <label htmlFor="is_blocked">Статус получателя</label>
                                    <UniversalSelect
                                        name='is_blocked'
                                        placeholder="Укажите статус реестра"
                                        onSelectChange={handleSelectorChange}
                                        firstOptionSelected
                                        className={"selector-choice"}
                                        required
                                        selectedOptions={[formData.is_blocked]}
                                        isSearchable={false}
                                        options={[
                                            {value: false, label: 'Получатель Активен'},
                                            {value: true, label: 'Получатель Отключен'},
                                        ]}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="registry_ids">Файлы реестров</label>
                                <UniversalSelect
                                    name='registry_ids'
                                    placeholder="Выберете файлы реестров"
                                    onSelectChange={handleSelectorChange}
                                    required
                                    isMulti
                                    selectedOptions={formData.registry_ids}
                                    fetchDataConfig={{
                                        model: 'Registry',
                                        searchTerm: {is_blocked: false}
                                    }}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="registry_ids">Emails</label>
                                <UniversalSelect
                                    name='emails'
                                    placeholder="Введите почту получателя"
                                    onSelectChange={handleSelectorChange}
                                    required
                                    isMulti
                                    selectedOptions={formData.emails}
                                    options={formData.emails && formData.emails.length > 0 ? (
                                        formData.emails.map((item) => ({
                                            value: item,
                                            label: `${item}`
                                        }))
                                    ) : []}
                                    createNewValues
                                />
                            </div>

                            <div>
                                <p>Дата создания: {createdAt}</p>
                                <p>Дата изменения: {updatedAt}</p>
                            </div>
                        </div>
                    </div>
                    <div className="w-100 mt-5 mb-5 d-flex justify-content-center">
                        <button className="btn btn-purple me-2" type="submit">Сохранить</button>
                        <Link href="/registries/recipient/index-page" className="btn btn-cancel ms-2"
                              type="button">Отмена</Link>
                    </div>
                </form>
            </div>
           
        </div>
    );
}
