import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import FormInput from '../../../../components/main/input/FormInput';
import {RECIPIENT_SHOW_API, RECIPIENT_UPDATE_API} from "../../../../routes/api";
import Head from "next/head";
import UniversalSelect from "../../../../components/main/input/UniversalSelect";
import Preloader from "../../../../components/main/system/Preloader";
import {RECIPIENT_INDEX_URL} from "../../../../routes/web";
import {useAlert} from "../../../../contexts/AlertContext";
import {useSession} from "next-auth/react";
import ProtectedElement from "../../../../components/main/system/ProtectedElement";
import {Divider} from "antd";

export default function EditRecipient() {
    const [processingLoader, setProcessingLoader] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        emails: '', // Начнем с одного поля по умолчанию
        is_blocked: '',
        registry_ids: '',
        createdAt: '',
        updatedAt: '',
    });
    const {openNotification} = useAlert();
    const [isLoading, setIsLoading] = useState(true);
    const [recipientName, setRecipientName] = useState('');
    const {data: session} = useSession(); // Получаем сессию
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
        setProcessingLoader(true)
        formData.create_author = formData.create_author ? formData.create_author : session.user.name
        formData.update_author = session.user.name

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
                openNotification({type: "success", message: responseData.message});
                await router.push(RECIPIENT_INDEX_URL);
            } else {
                openNotification({type: "error", message: responseData.message});
            }

        } catch (error) {
            openNotification({type: "error", message: error.message});
            console.error(error);
        }
        setProcessingLoader(false)
    };

    const recipientTypes = [
        {value: 1, label: 'Каждый день'},
        {value: 2, label: 'Раз в неделю'},
        {value: 3, label: 'Раз в месяц'},
        {value: 4, label: 'Раз в год'},
    ];


    const handleSelectorChange = (valuesArray, name) => {
        if (name === 'emails') {
            let emails = [];

            if (Array.isArray(valuesArray)) {
                emails = valuesArray.flatMap(value => value.split(',').map(email => email.trim()));
            } else if (typeof valuesArray === 'string') {
                emails = valuesArray.split(',').map(email => email.trim());
            }

            setFormData((prevFormData) => ({
                ...prevFormData,
                [name]: emails,
            }));
        } else {
            setFormData((prevFormData) => ({
                ...prevFormData,
                [name]: valuesArray,
            }));
        }
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
                        create_author: responseData.create_author,
                        update_author: responseData.update_author,
                        createdAt: responseData.createdAt,
                        updatedAt: responseData.updatedAt,
                    }));

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
            fetchRecipientItem();
        }
    }, [itemId]);
    if (isLoading) {
        return <div>
            <Preloader/>
        </div>;
    }

    return (
        <ProtectedElement allowedPermissions={'registry_management'}>
            <div>
                <Head>
                    <title>{recipientName} | {process.env.NEXT_PUBLIC_APP_NAME}</title>
                </Head>

                {processingLoader && <Preloader/>}
                <div className={`${processingLoader ? 'd-none' : 'd-flex'} flex-column`}>
                    <h1>Редактировать получателя</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="container d-flex">
                            <div className="container w-50 mt-2">
                                <FormInput
                                    type="text"
                                    label="Получатель"
                                    className="input-field"
                                    id="name"
                                    placeholder="Название"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="w-50">
                                        <UniversalSelect
                                            name='type'
                                            label="Период отправки реестра"
                                            placeholder="Выберете период"
                                            onSelectChange={handleSelectorChange}
                                            firstOptionSelected
                                            selectedOptions={[formData.type]}
                                            required
                                            isSearchable={false}
                                            options={recipientTypes}
                                        />
                                    </div>
                                    <div className="text-nowrap">
                                        <UniversalSelect
                                            name='is_blocked'
                                            label="Статус получателя"
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
                                <UniversalSelect
                                    name='registry_ids'
                                    label="Файлы реестров"
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
                                <UniversalSelect
                                    key={JSON.stringify(formData.emails)}
                                    name='emails'
                                    label="Emails"
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

                                {formData.createdAt || formData.updatedAt ? (
                                    <>
                                        <Divider/>
                                        <div className='d-flex align-items-center justify-content-between'>
                                            <h6>Создано:</h6>
                                            <h6>{formData.createdAt ||
                                                <span className="text-secondary">(Дата отсутствует)</span>
                                            } - {
                                                formData.create_author ||
                                                <span className="text-secondary">(Имя отсутствует)</span>
                                            }
                                            </h6>
                                        </div>
                                        <div className='d-flex align-items-center justify-content-between'>
                                            <h6>Обновлено:</h6>
                                            <h6>{formData.updatedAt ||
                                                <span className="text-secondary">(Дата отсутствует)</span>
                                            } - {
                                                formData.update_author ||
                                                <span className="text-secondary">(Имя отсутствует)</span>
                                            }
                                            </h6>
                                        </div>
                                    </>
                                ) : null}
                            </div>
                        </div>
                        <div className="w-100 mt-5 mb-5 d-flex justify-content-center">
                            <button className="btn btn-purple me-2" type="submit">Сохранить</button>
                            <button onClick={() => router.back()} className="btn btn-cancel ms-2"
                                    type="button">
                                Отмена
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </ProtectedElement>
    );
}
