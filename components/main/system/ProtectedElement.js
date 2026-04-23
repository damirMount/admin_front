import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../../contexts/AccessContext';
import Preloader from "./Preloader";

const ProtectedElement = ({
                              children,
                              allowedPermissions,
                              redirect = true,
                              fallback = null
                          }) => {
    const { session, checkAccess } = useAuth();

    // Состояния: 'loading', 'granted', 'denied'
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        let isMounted = true;

        const verify = async () => {
            if (!session) {
                if (isMounted) setStatus('denied');
                return;
            }

            try {
                // Предполагаем, что checkAccess возвращает boolean
                const hasAccess = await checkAccess(allowedPermissions, redirect);

                if (isMounted) {
                    setStatus(hasAccess ? 'granted' : 'denied');
                }
            } catch (error) {
                console.error("[AUTH] Access check failed:", error);
                if (isMounted) setStatus('denied');
            }
        };

        verify();

        return () => { isMounted = false; };
    }, [allowedPermissions, session, checkAccess, redirect]);

    // Логика отображения
    if (status === 'loading') {
        return redirect ? <Preloader /> : null;
    }

    if (status === 'granted') {
        return <>{children}</>;
    }

    // Если доступ запрещен
    return redirect ? <Preloader /> : fallback;
};

export default React.memo(ProtectedElement);
