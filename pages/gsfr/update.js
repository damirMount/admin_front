import React, {useState} from "react";
import Preloader from "../../components/main/Preloader";
import {parseCookies} from "nookies";
import {GSFR_UPDATE_API} from "../../routes/api";
import Head from "next/head";
import {useAlert} from "../../contexts/AlertContext";
import FormInput from "../../components/main/input/FormInput";


export default function IndexPage() {
    const [processingLoader, setProcessingLoader] = useState(false);

    const {clearAlertMessage, showAlertMessage} = useAlert();
    const [formData, setFormData] = useState({ urls: {} });

    const handleInputChange = (event) => {
        const {name, value} = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            urls: {
                ...prevFormData.urls,
                [name]: value}
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
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body:  JSON.stringify(formData),
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
            <div>
                <h1>Обновление ГСФР</h1>

                {processingLoader && (
                    <Preloader/>
                )}

                <div className={`${processingLoader ? 'd-none' : 'd-flex'} flex-row w-100 mt-5`}>
                    <form
                        className="d-flex w-100 flex-column justify-content-center align-items-center align-content-center">
                        <div className="w-50 d-flex flex-column justify-content-center">
                            <div className="form-group">
                                <label htmlFor="UN">Сводный санкционный перечень Совета Безопасности ООН
                                </label>
                                <FormInput
                                    type="url"
                                    className="input-field"
                                    id="UN"
                                    name="UN"
                                    value={formData.urls.UN}
                                    placeholder="Вставьте ссылку"
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="SSPKR">Сводный санкционный перечень Кыргызской Республики</label>
                                <FormInput
                                    type="text"
                                    className="input-field"
                                    id="SSPKR"
                                    name="SSPKR"
                                    value={formData.urls.SSPKR}
                                    placeholder="Вставьте ссылку"
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="PFT">ПФТ</label>
                                <FormInput
                                    type="text"
                                    className="input-field"
                                    id="PFT"
                                    name="PFT"
                                    value={formData.urls.PFT}
                                    placeholder="Вставьте ссылку"
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="PLPD_FIZ">ПЛПД Физ.лица</label>
                                <FormInput
                                    type="text"
                                    className="input-field"
                                    id="PLPD_FIZ"
                                    name="PLPD_FIZ"
                                    value={formData.urls.PLPD_FIZ}
                                    placeholder="Вставьте ссылку"
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="PLPD_UR">ПЛПД Юр.лица</label>
                                <FormInput
                                    type="text"
                                    className="input-field"
                                    id="PLPD_UR"
                                    name="PLPD_UR"
                                    value={formData.urls.PLPD_UR}
                                    placeholder="Вставьте ссылку"
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <button
                                type="button"
                                className="btn btn-purple mt-5"
                                onClick={handleUpdate}
                            >
                                Обновить список
                            </button>
                        </div>
                    </form>
                </div>

            </div>

        </div>
    );
}
