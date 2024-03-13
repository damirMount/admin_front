import {useEffect} from 'react';
import {useRouter} from 'next/router';
import {LOGIN_PAGE_URL} from "../../routes/web";
import SidebarTab from "../main/navigation/SidebarTab";
import Navbar from "../main/navigation/Navbar";
import {ConfigProvider} from "antd";
import ruRU from "antd/locale/ru_RU";
import Footer from "../main/Footer";
import Alert from "../main/system/Alert";
import {useSession} from 'next-auth/react'; // Импортируем useSession здесь

const AuthCheck = (WrappedComponent) => {
    const Check = (props) => {
        const router = useRouter();
        const {data: session} = useSession(); // Получаем сессию здесь

        if ((!session || new Date(session.expires).getTime() < Date.now()) && router.pathname !== LOGIN_PAGE_URL) {
            router.replace(LOGIN_PAGE_URL);
            return null;
        } else {
            return (
                <div>
                    <div className="d-flex w-100 overflow-hidden">
                        {router.pathname !== LOGIN_PAGE_URL && <SidebarTab/>}
                        <div className="w-100 overflow-hidden">
                            <Navbar/>
                            <div className=" w-100 overflow-x-auto overflow-y-hidden mt-5">
                                <div className="container body-container mt-5">
                                    <ConfigProvider locale={ruRU}>
                                        <WrappedComponent {...props}/>
                                    </ConfigProvider>
                                </div>
                                <Footer/>
                            </div>
                        </div>
                    </div>
                    <Alert/>
                </div>
            );
        }
    };

    return Check;
};

export default AuthCheck;
