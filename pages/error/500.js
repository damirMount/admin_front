import React from 'react';
import Head from "next/head";
import {Button, Result} from "antd";
import {MAIN_PAGE_URL} from "../routes/web";

export default function Error500() {
    return (
        <div>
            <Head>
                <title>500 ВНУТРЕНЯЯ ОШИБКА СЕРВЕРА | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div className='d-flex justify-content-center align-items-center flex-column h-100 w-100 mt-5'
                 style={{minHeight: '80vh'}}>
                <div>
                    <Result
                        status="500"
                        title="500 НЕИЗВЕСТНАЯ ОШИБКА"
                        subTitle="Извините, произошла неизвестная ошибка, пожалуйста попробуйте позже"
                        extra={<Button type="primary" href={MAIN_PAGE_URL}>Вернуться на главную</Button>}
                    />
                </div>
            </div>
        </div>
    );
}
