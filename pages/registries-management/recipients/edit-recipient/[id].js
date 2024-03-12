import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import FormInput from '../../../../components/main/input/FormInput';
import Link from "next/link";
import {RECIPIENT_SHOW_API, RECIPIENT_UPDATE_API} from "../../../../routes/api";
import Head from "next/head";
import UniversalSelect from "../../../../components/main/input/UniversalSelect";
import Preloader from "../../../../components/main/system/Preloader";
import {RECIPIENT_INDEX_URL} from "../../../../routes/web";
import {useAlert} from "../../../../contexts/AlertContext";
import {useSession} from "next-auth/react";

export default function EditRecipient() {
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        emails: '', // Начнем с одного поля по умолчанию
        is_blocked: '',
        registry_ids: '',
        createdAt: '',
        updatedAt: '',
    });
    const {clearAlertMessage, showAlertMessage} = useAlert();
    const [isLoading, setIsLoading] = useState(true);
    const [createdAt, setCreatedAt] = useState('');
    const [updatedAt, setUpdatedAt] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const { data: session } = useSession(); // Получаем сессию
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
            const dataToSend = {
                ...formData,
                emails: formData.emails,
            };

            const response = await fetch(`${RECIPIENT_UPDATE_API}/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.accessToken}`,
                },
                body: JSON.stringify(dataToSend),
            });

            const responseData = await response.json();
            if (response.ok) {
                showAlertMessage({type: "success", text: responseData.message});
                await router.push(RECIPIENT_INDEX_URL);
            } else {
                showAlertMessage({type: "error", text: responseData.message});
            }
        } catch (error) {
            showAlertMessage({type: "error", text: error.message});
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
                const response = await fetch(`${RECIPIENT_SHOW_API}/${itemId}`, {
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`,
                    },
                });
                const responseData = await response.json();
                if (response.ok) {
                    setRecipientName(responseData.name)
                    setFormData((prevFormData) => ({
                        ...prevFormData,
                        name: responseData.name,
                        type: responseData.type,
                        emails: responseData.emails.split(',').map(email => email.trim()),
                        is_blocked: responseData.is_blocked,
                        registry_ids: responseData.registry_ids.map((item) => item.id),
                    }));
                    setCreatedAt(responseData.createdAt)
                    setUpdatedAt(responseData.updatedAt)

                } else {
                    showAlertMessage({type: "error", text: responseData.message});
                    console.error('Ошибка при загрузке данных с API');
                }
            } catch (error) {
                console.error(error);
                showAlertMessage({type: "error", text: error.message});
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
                        <Link href={RECIPIENT_INDEX_URL}  className="btn btn-cancel ms-2"
                              type="button">Отмена</Link>
                    </div>
                </form>
            </div>
           
        </div>
    );
}