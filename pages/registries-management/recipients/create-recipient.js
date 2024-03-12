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

export default function CreateRecipient() {
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        is_blocked: '',
        registry_ids: '',
        emails: '', // Начнем с одного поля по умолчанию
    });
    const router = useRouter();
    const {clearAlertMessage, showAlertMessage} = useAlert();
    const { data: session } = useSession(); // Получаем сессию
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

    return (
        <div>
            <Head>
                <title>Создать получателя | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div className=" mt-5">
                <h1>Создать получателя</h1>
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
    );
}