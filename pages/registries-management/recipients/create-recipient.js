import React, {useState} from 'react';
import {useRouter} from 'next/router';
import FormInput from '../../../components/main/input/FormInput';
import Link from 'next/link';
import {RECIPIENT_CREATE_API} from '../../../routes/api'
import Head from "next/head";
import UniversalSelect from "../../../components/main/input/UniversalSelect";
import {RECIPIENT_INDEX_URL} from "../../../routes/web";
import {useAlert} from "../../../contexts/AlertContext";
import {useSession} from "next-auth/react";
import ProtectedElement from "../../../components/main/system/ProtectedElement";

export default function CreateRecipient() {
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        is_blocked: '',
        registry_ids: '',
        emails: '', // Начнем с одного поля по умолчанию
    });
    const router = useRouter();
    const {openNotification} = useAlert();
    const {data: session} = useSession(); // Получаем сессию
    const recipientTypes = [
        {value: 1, label: 'Каждый день'},
        {value: 2, label: 'Раз в неделю'},
        {value: 3, label: 'Раз в месяц'},
        {value: 4, label: 'Раз в год'},
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
    };


    const handleSubmit = async (event) => {
        event.preventDefault();

        try {

            // Формируем данные для отправки на сервер, включая данные emails
            const dataToSend = {
                ...formData,
            };

            // Отправка данных формы на API
            const response = await fetch(RECIPIENT_CREATE_API, {
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
                await router.push(RECIPIENT_INDEX_URL);
            } else {
                openNotification({type: "error", message: responseData.message});
            }
        } catch (error) {
            openNotification({type: "error", message: error.message});
            console.error(error);
        }
    };

    return (
        <ProtectedElement allowedPermissions={'registry_management'}>
            <div>
                <Head>
                    <title>Создать получателя | {process.env.NEXT_PUBLIC_APP_NAME}</title>
                </Head>
                <div>
                    <h1>Создать получателя</h1>
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
                                    fetchDataConfig={{
                                        model: 'Registry',
                                        searchTerm: {is_blocked: false}
                                    }}
                                />
                                <UniversalSelect
                                    name='emails'
                                    label="Emails"
                                    placeholder="Введите почту получателя"
                                    onSelectChange={handleSelectorChange}
                                    required
                                    isMulti
                                    options={formData.emails && formData.emails.length > 0 ? (
                                        formData.emails.map((item) => ({
                                            value: item,
                                            label: `${item}`
                                        }))
                                    ) : []}
                                    createNewValues
                                />
                            </div>
                        </div>
                        <div className="w-100 mt-5 mb-5 d-flex justify-content-center">
                            <button className="btn btn-purple me-2" type="submit">
                                Сохранить
                            </button>
                            <Link href={RECIPIENT_INDEX_URL} className="btn btn-cancel ms-2" type="button">
                                Отмена
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </ProtectedElement>
    );
}
