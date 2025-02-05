import {createContext, useContext} from "react";
import {useSession} from "next-auth/react";
import {useRouter} from "next/router";
import {ERROR_PAGE_403} from "../routes/web";

const AccessContext = createContext();

export const AuthProvider = ({children}) => {
    const {data: session} = useSession();
    const router = useRouter();

    const checkAccess = (allowedPermissions, redirect) => {
        let userHasAccess = false

        if (session?.user?.permissions && allowedPermissions) {
            userHasAccess = session?.user?.permissions.some(permission => allowedPermissions.includes(permission.name));
        }

        if (!userHasAccess) {
            if (redirect) {
                router.push(ERROR_PAGE_403);
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

export const useAuth = () => useContext(AccessContext);
