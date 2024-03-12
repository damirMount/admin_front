// В файле contexts/AuthContext.js
import {createContext, useContext} from "react";
import {useSession} from "next-auth/react";
import {useRouter} from "next/router";
import {MAIN_PAGE_URL} from "../routes/web";

const AccessContext = createContext();

export const AuthProvider = ({children}) => {
    const {data: session, status} = useSession();
    const router = useRouter();

    const checkAccess = (allowedRoles, redirect) => {
        // const hasRole = session?.user?.roles.some(role => allowedRoles.includes(role));
        const userHasAccess = session && allowedRoles === session.user.id_role;
        if (!userHasAccess) {
            if (redirect) {
                router.push(MAIN_PAGE_URL); // Перенаправляем на страницу входа
            } else {
                return false
            }
        } else {
            return true
        }
    };

    return (
        <AccessContext.Provider value={{session, checkAccess}}>
            {children}
        </AccessContext.Provider>
    );
};

// Хук для использования контекста
export const useAuth = () => useContext(AccessContext);
