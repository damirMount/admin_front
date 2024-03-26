import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ERROR_PAGE_403 } from "../routes/web";
import { CHECK_USER_ACCESS_API } from "../routes/api";
import { useAlert } from "./AlertContext";

const AccessContext = createContext();

export const AuthProvider = ({ children }) => {
    const { data: session } = useSession();
    const router = useRouter();
    const { openNotification } = useAlert();

    const checkAccess = async (allowedPermissions, redirect = true) => {
        try {
            const dataToSend = {
                userId: session.user.id,
                permissionName: allowedPermissions
            };

            const response = await fetch(CHECK_USER_ACCESS_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.accessToken}`,
                },
                body: JSON.stringify(dataToSend),
            });

            if (response.ok) {
                return true;
            } else {
                if (redirect) {
                    router.push(ERROR_PAGE_403);
                }
                return false;
            }
        } catch (error) {
            openNotification({ type: "error", message: error.message });
            console.error(error);
            return false;
        }
    };

    return (
        <AccessContext.Provider value={{ session, checkAccess }}>
            {children}
        </AccessContext.Provider>
    );
};

// Хук для использования контекста
export const useAuth = () => useContext(AccessContext);
