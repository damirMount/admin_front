import React, {useState} from 'react';
import {MAIN_PAGE_URL} from "../routes/web";
import {signIn} from "next-auth/react";
import FormInput from "../components/main/input/FormInput";
import Head from "next/head";
import {useAlert} from "../contexts/AlertContext";

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const {openNotification} = useAlert();
    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const responseData = await signIn('credentials', {
                redirect: false,
                username,
                password,
            })
            if (responseData.ok) {
                window.location.replace(MAIN_PAGE_URL);
            } else {
                openNotification({type: "error", message: responseData.error});
            }
        } catch (error) {
            openNotification({type: "error", message: error});
        }
    }

    return (
        <div>
            <Head>
                <title>Вход в систему | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div className='d-flex justify-content-center align-items-center flex-column h-100 w-100 mt-5'
                 style={{minHeight: '75vh'}}>
                <div>
                    <h1>Вход в систему</h1>
                </div>
                <div className="w-25">
                    <div className="w-100">
                        <form onSubmit={handleSubmit}>
                            <div className='form-group'>
                                <label htmlFor="username">Логин:</label>
                                <FormInput
                                    type="text"
                                    placeholder='Логин'
                                    className="input-field"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div className='form-group'>
                                <label htmlFor="password">Пароль:</label>
                                <FormInput
                                    type="password"
                                    placeholder='Пароль'
                                    className="input-field"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="d-flex justify-content-center">
                                <button type="submit" className="mt-4 btn btn-purple">
                                    Войти
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
