import React from 'react';
import Head from "next/head";

export default function AccessDeniedPage() {
    return (
        <div>
            <Head>
                <title>403 ДОСТУП ЗАПРЕЩЁН | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div className='d-flex justify-content-center align-items-center flex-column h-100 w-100 mt-5'
                 style={{minHeight: '75vh'}}>
                <div>
                    <h1>403 ДОСТУП ЗАПРЕЩЁН</h1>
                </div>
            </div>
        </div>
    );
}
