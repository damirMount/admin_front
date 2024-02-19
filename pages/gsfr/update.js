import React, {useState} from "react";
import Footer from "../../components/main/Footer";
import Preloader from "../../components/main/Preloader";
import {parseCookies} from "nookies";
import {GSFR_UPDATE_API} from "../../routes/api";
import Head from "next/head";
import {useAlert} from "../../contexts/AlertContext";


export default function IndexPage() {
    const [processingLoader, setProcessingLoader] = useState(false);
    const formData = new FormData();
    const {clearAlertMessage, showAlertMessage} = useAlert();


    const handleUpdateDealer = async () => {
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
            <div className=" mt-5">
                <h1>Обновление ГСФР</h1>

                {processingLoader ? (
                    <Preloader/>
                ) : (
                    <form className="d-flex w-100 justify-content-center align-items-center align-content-center">
                        <button
                            type="button"
                            className="btn btn-purple"
                            onClick={handleUpdateDealer}
                        >
                            Обновить список
                        </button>
                    </form>
                )}

            </div>
           
        </div>
    );
}
