import React, {useEffect, useState} from 'react';
import {useAuth} from '../../../contexts/AccessContext';
import Preloader from "./Preloader";

const ProtectedElement = ({children, accessGranted, redirect}) => {
    if (!accessGranted && redirect) {
        return <Preloader/>; // Можно отображать загрузочный индикатор здесь
    }
    if (!accessGranted) {
        console.log(false)
        return false
    }

    return children;
};

const ProtectedElementContainer = ({children, allowedPermissions, redirect = true}) => {
    const {session, checkAccess} = useAuth();
    const [accessGranted, setAccessGranted] = useState(false);

    useEffect(() => {
        const fetchAccess = async () => {
            // Выполняем проверку доступа
            const hasAccess = session && await checkAccess(allowedPermissions, redirect);
            setAccessGranted(hasAccess);
        };

        fetchAccess();
    }, []);
// Передаем результат проверки доступа в компонент защищенного маршрута
        return <ProtectedElement accessGranted={accessGranted} redirect={redirect}>{children}</ProtectedElement>;


};

export default ProtectedElementContainer;
