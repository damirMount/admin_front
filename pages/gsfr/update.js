import React, {useState} from "react";
import Footer from "../../components/main/Footer";
import Preloader from "../../components/main/Preloader";
import {parseCookies} from "nookies";
import {GSFR_UPDATE_API} from "../../routes/api";
import Head from "next/head";
import {useAlert} from "../../contexts/AlertContext";
import FormInput from "../../components/main/input/FormInput";


export default function IndexPage() {
    const [processingLoader, setProcessingLoader] = useState(false);

    const {clearAlertMessage, showAlertMessage} = useAlert();
    const [formData, setFormData] = useState();
    
    const handleInputChange = (event) => {
        const {name, value} = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleUpdate = async () => {
        try {

            const cookies = parseCookies();
            const authToken = JSON.parse(cookies.authToken).value;
            const updateGSFRApiUrl = `${GSFR_UPDATE_API}`;
            const response = await fetch(updateGSFRApiUrl, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
                body: formData,
            });
            setProcessingLoader(true);
            const responseData = await response.json();


            if (response.ok) {
                showAlertMessage({type: "success", text: responseData.message});
            } else {
                showAlertMessage({type: "error", text: responseData.message});
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            showAlertMessage({type: "error", text: "Внутренняя ошибка сервера."});
        } finally {
            setProcessingLoader(false);
        }
    };

    return (
        <div>
            <Head>
                <title>Обновление ГСФР | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div className="">
                <h1>Обновление ГСФР</h1>

                {processingLoader ? (
                    <Preloader/>
                ) : (
                    <form className="d-flex w-100 flex-column justify-content-center align-items-center align-content-center">
                        <div className="w-50 d-flex flex-column justify-content-center">
                        <div className="form-group">
                            <label htmlFor="name">Сводный санкционный перечень Совета Безопасности ООН
                            </label>
                            <FormInput
                                type="url"
                                className="input-field"
                                id="name"
                                name="name"
                                placeholder="Название"
                                
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="name">Сводный санкционный перечень Кыргызской Республики</label>
                            <FormInput
                                type="text"
                                className="input-field"
                                id="name"
                                name="name"
                                placeholder="Название"
                                
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="name">Название файла реестра*</label>
                            <FormInput
                                type="text"
                                className="input-field"
                                id="name"
                                name="name"
                                placeholder="Название"
                                
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="name">Название файла реестра*</label>
                            <FormInput
                                type="text"
                                className="input-field"
                                id="name"
                                name="name"
                                placeholder="Название"
                                
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="name">Название файла реестра*</label>
                            <FormInput
                                type="text"
                                className="input-field"
                                id="name"
                                name="name"
                                placeholder="Название"
                                
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <button
                            type="button"
                            className="btn btn-purple mt-5"
                            // onClick={handleUpdate}
                        >
                            Обновить список
                        </button>
                        </div>
                    </form>
                )}

            </div>

        </div>
    );
}
