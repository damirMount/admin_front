import {useState} from 'react';
import {useRouter} from 'next/router';
import SelectWithSearch from '../components/SelectWithSearch';
import FormInput from '../components/FormInput';
import {parseCookies} from 'nookies';
import Navigation from '../components/Navigation';

export default function UpdateDBPage() {
    const [formData, setFormData] = useState({
        serviceId: '',
        identifierOrder: '',
        paySumOrder: '',
        file: '',
    });
    const router = useRouter();

    const handleInputChange = (event) => {
        const {name, value, type, files} = event.target;

        if (type === 'file' && files.length) {
            const file = files[0];
            const reader = new FileReader();

            reader.onloadend = () => {
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    [name]: reader.result,
                }));
            };

            reader.readAsDataURL(file);
        } else {
            setFormData((prevFormData) => ({
                ...prevFormData,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const cookies = parseCookies();
            const authToken = JSON.parse(cookies.authToken).value;
            const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/abonent-service/store`;
            // Отправка данных формы на API
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                console.log('Данные успешно отправлены на API');
                // Перенаправление на другую страницу после успешной отправки
                router.push('/update-db');
            } else {
                console.error('Ошибка при отправке данных на API');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <div>
                <Navigation></Navigation>
            </div>
            <div className="container">
                <h1>Страница обновления БД</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="service_id">Сервис</label>
                        <SelectWithSearch
                            apiUrl={`${process.env.NEXT_PUBLIC_API_URL}/listServices`}
                            required
                            name="serviceId"
                            onSelectChange={(selectedValue) =>
                                handleInputChange({
                                    target: {name: 'serviceId', value: selectedValue},
                                })
                            }
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="identifierOrder">Идентификатор*</label>
                        <FormInput
                            type="number"
                            id="identifierOrder"
                            name="identifierOrder"
                            value={formData.identifierOrder}
                            onChange={handleInputChange}
                            required
                            className="input-field"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="paySumOrder">Оплачиваемая сумма</label>
                        <FormInput
                            type="number"
                            id="paySumOrder"
                            name="paySumOrder"
                            value={formData.paySumOrder}
                            onChange={handleInputChange}
                            required
                            className="input-field"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="file">Выбрать файл</label>
                        <FormInput
                            type="file"
                            id="file"
                            name="file"
                            accept=".xls,.xlsx,.dbf,.txt,.csv"
                            onChange={handleInputChange}
                            required
                            className="input-field"
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

          .input-field {
            width: 100%;
            padding: 0.5rem;
            border-radius: 4px;
            border: 1px solid #ccc;
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
