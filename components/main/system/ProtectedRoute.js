import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AccessContext';

const ProtectedRoute = ({ children, accessGranted }) => {
    if (!accessGranted) {
        return null; // Можно отображать загрузочный индикатор здесь
    }

    return children;
};

const ProtectedRouteContainer = ({ children, allowedRoles, redirect = true }) => {
    const { session, checkAccess } = useAuth();
    const [accessGranted, setAccessGranted] = useState(false);

    useEffect(() => {
        // Выполняем проверку доступа
        const hasAccess = session && checkAccess(allowedRoles, redirect);
        setAccessGranted(hasAccess);
    }, [allowedRoles, checkAccess, session]);

    // Передаем результат проверки доступа в компонент защищенного маршрута
    return <ProtectedRoute accessGranted={accessGranted}>{children}</ProtectedRoute>;
};

export default ProtectedRouteContainer;
