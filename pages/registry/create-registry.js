import React, {useState} from 'react';
import {useRouter} from 'next/router';
import FormInput from '../../components/FormInput';
import {parseCookies} from "nookies";
import Navigation from "../../components/Navigation";
import CustomSelect from "../../components/CustomSelect";
import MultiSelectWithSearch from "../../components/MultiSelectWithSearch";

export default function CreateRegistry() {
    const [formData, setFormData] = useState({
        name: '', 
        type: '', 
        is_blocked: '', 
        registry_file_ids: '',
        emails: ''
    });
    const router = useRouter();

    const RegistryTypes = [
        {value: '1', label: 'Ежедневный'},
        {value: '2', label: 'Еженедельный'},
        {value: '3', label: 'Ежемесячный'},
        {value: '4', label: 'Ежегодный'},
    ];

    const [emails, setEmails] = useState(['']);

    const handleEmailChange = (index, value) => {
        const newEmails = [...emails];
        newEmails[index] = value;
        setEmails(newEmails);
    };

    const handleAddEmailInput = () => {
        setEmails([...emails, '']); // Добавляем новое пустое поле
    };

    const handleInputChange = (event) => {
        const {name, value} = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData, [name]: value,
        }));
    };

    const handleTextareaChange = (event) => {
        const {name, value} = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData, [name]: value,
        }));
    };


    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const cookies = parseCookies();
            const authToken = JSON.parse(cookies.authToken).value;

            const apiUrl = process.env.NEXT_PUBLIC_REGISTRY_CREATE_URL;


            // Формируем данные для отправки на сервер, включая данные emails
            const dataToSend = {
                ...formData,
                emails: emails,
            };

            // Отправка данных формы на API
            const response = await fetch(apiUrl, {
                method: 'POST', headers: {
                    'Content-Type': 'application/json', Authorization: `Bearer ${authToken}`,
                }, body: JSON.stringify(dataToSend),
            });

            if (response.ok) {
                console.log('Данные успешно отправлены на API');
                // Перенаправление на другую страницу после успешной отправки
                router.push('/registry/index-page');
            } else {
                console.error('Ошибка при отправке данных на API');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (<div>
            <div>
                <Navigation></Navigation>
            </div>
            <div className="container">
                <h1>Страница создания реестров</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Название реестра*</label>
                        <FormInput
                            type="text"
                            className="input-field"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="name">Тип реестра*</label>
                        <CustomSelect
                            options={RegistryTypes}
                            required
                            name="type"
                            value={formData.type}
                            onSelectChange={(selectedValue) => handleInputChange({
                                target: {
                                    name: 'type', value: selectedValue
                                }
                            })}
                        />
                    </div>

                    <div className="form-gtoup">
                        <label htmlFor="emails">Email</label>
                        {emails.map((email, index) => (
                            <div key={index} className="form-group">

                                <FormInput
                                    type="email"
                                    id={`email-${index}`}
                                    value={email}
                                    onChange={(e) => handleEmailChange(index, e.target.value)}
                                />
                            </div>
                        ))}
                        <button type="button" onClick={handleAddEmailInput}>
                            Добавить еще email
                        </button>
                    </div>
                    <div className="form-group">
                        <label htmlFor="registry_file_ids">Файлы реестров</label>

                        <MultiSelectWithSearch
                            apiUrl={`${process.env.NEXT_PUBLIC_GET_REGISTRY_FILES_URL}`}
                            required
                            name="registry_file_ids"
                            multi={true}
                            onSelectChange={(selectedValues) => handleInputChange({
                            target: {
                                name: 'registry_file_ids',
                                value: selectedValues,
                                }
                            })}
                            defaultValue={Array.isArray(formData.registry_file_ids) ? formData.registry_file_ids : []}

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
                            onSelectChange={(selectedValue) => {
                                setFormData((prevFormData) => ({
                                    ...prevFormData,
                                    is_blocked: selectedValue,
                                }));
                            }}
                            name='is_blocked'
                        />

                    </div>
                    <button type="submit">Сохранить</button>
                </form>

                <style jsx>{`
                  .container {
                    max-width: 500px;
                    margin: 10px auto 0;
                    padding: 2rem;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                  }

                  h1 {
                    text-align: center;
                    margin-bottom: 2rem;
                    font-family: sans-serif;
                    font-size: 1.5rem;
                  }

                  .form-group {
                    margin-bottom: 2rem;
                  }

                  label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: bold;
                    font-family: sans-serif;
                  }

                  button[type='submit'] {
                    background-color: grey;
                    color: #fff;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    cursor: pointer;
                    width: 100%;
                  }

                  button[type='submit']:hover {
                    background-color: #0069d9;
                  }
                `}</style>
            </div>
        </div>

    );
}
