import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import FormInput from '../../../components/FormInput';
import { parseCookies } from 'nookies';
import Navigation from '../../../components/Navigation';
import FormTextarea from '../../../components/FormTextarea';
import CustomSelect from '../../../components/CustomSelect';
import MultiSelectWithSearch from '../../../components/MultiSelectWithSearch';

export default function EditRegistry() {
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        emails: '',
        is_blocked: '',
        registry_file_ids: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRegistryFileIds, setSelectedRegistryFileIds] = useState([]);

    const router = useRouter();
    const itemId = router.query.id;

    useEffect(() => {
        const fetchRegistryItem = async () => {
            try {
                const cookies = parseCookies();
                const authToken = JSON.parse(cookies.authToken).value;
                const apiUrl = process.env.NEXT_PUBLIC_API_URL + '/registry-file/' + itemId;
                const response = await fetch(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('data get');
                    setSelectedRegistryFileIds(data.registry_file_ids);
                    setFormData((prevFormData) => ({
                        ...prevFormData,
                        name: data.name,
                        type: data.type,
                        emails: data.emails,
                        is_blocked: data.is_blocked,
                        registry_file_ids: data.registry_file_ids.map((item) => item.id),
                    }));
                } else {
                    console.error('Ошибка при загрузке данных с API');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false); // Устанавливаем isLoading в false после завершения загрузки
            }
        };

        if (itemId) {
            fetchRegistryItem();
        }
    }, [itemId]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleTextareaChange = (event) => {
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
            const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/registry-file/${itemId}`;

            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                console.log('Данные успешно отправлены на API');
                router.push('/registry/index-page');
            } else {
                console.error('Ошибка при отправке данных на API');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const registryTypes = [
        { value: 1, label: 'Ежедневный' },
        { value: 2, label: 'Еженедельный' },
        { value: 3, label: 'Ежемесячный' },
        { value: 4, label: 'Ежегодный' },
    ];

    const blockedOptions = [
        { value: true, label: 'Да' },
        { value: false, label: 'Нет' },
    ];

    const selectedBlockedOption = blockedOptions.find(
        (option) => option.value === formData.is_blocked
    );
    const selectedTypeOption = registryTypes.find(
        (option) => option.value === formData.type
    );

    if (isLoading) {
        return <div>Loading...</div>; // Отображаем сообщение о загрузке пока данные не получены
    }

    return (
        <div>
            <div>
                <Navigation />
            </div>
            <div className="container">
                <h1>Страница обновления реестров</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Название рестра*</label>
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
                        <label htmlFor="type">Тип реестра*</label>
                        <CustomSelect
                            options={registryTypes}
                            required
                            name="type"
                            defaultValue={selectedTypeOption}
                            selectedValue={[formData.type]}
                            onSelectChange={(selectedValue) =>
                                handleInputChange({ target: { name: 'type', value: selectedValue } })
                            }
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="emails">Emails</label>
                        <FormTextarea
                            id="emails"
                            name="emails"
                            value={formData.emails}
                            onChange={handleTextareaChange}
                            rows={6}
                            cols={60}
                            className="text-field"
                        />
                        <sup>Если адресов несколько, то перечислить их через запятую</sup>
                    </div>
                    <div className="form-group">
                        <label htmlFor="registry_file_ids">Файлы реестров</label>
                        {!isLoading && (
                            <MultiSelectWithSearch
                                apiUrl={`${process.env.NEXT_PUBLIC_API_URL}/registry-file/all`}
                                defaultValue={selectedRegistryFileIds}
                                name="registry_file_ids"
                                multi={false}
                                onSelectChange={(selectedValue) =>
                                    handleInputChange({ target: { name: 'registry_file_ids', value: selectedValue } })
                                }
                            />
                        )}
                    </div>
                    <div className="form-group">
                        <label htmlFor="is_blocked">Отключить сервис</label>
                        <CustomSelect
                            options={blockedOptions}
                            required
                            defaultValue={selectedBlockedOption}
                            selectedValue={formData.is_blocked}
                            onSelectChange={(selectedValue) =>
                                handleInputChange({ target: { name: 'is_blocked', value: selectedValue } })
                            }
                            name="is_blocked"
                        />
                    </div>
                    <button type="submit">Сохранить</button>
                </form>
            </div>

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
            `}</style>
        </div>
    );
}
