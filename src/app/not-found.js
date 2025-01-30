import React from 'react';
import Head from "next/head";
import {Button, Result} from "antd";
import {MAIN_PAGE_URL} from "../../routes/web";
import Navbar from "../../components/main/navigation/Navbar";
export default function Custom404() {
    return (
        <div>
            <Head>
                <title>404 СТРАНИЦА НЕ НАЙДЕНА | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <Navbar/>
            <div className='d-flex justify-content-center align-items-center h-100 w-100'
                 style={{minHeight: '100vh'}}>
                    <Result
                        status="404"
                        title="404 СТРАНИЦА НЕ НАЙДЕНА"
                        subTitle="Извините, данная страница не существует"
                        extra={<Button type="primary" href={MAIN_PAGE_URL}>Вернуться на главную</Button>}
                    />
            </div>
        </div>
    );
}
