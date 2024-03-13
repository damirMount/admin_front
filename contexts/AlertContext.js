// В AlertContext.js

import React, {createContext, useContext, useState} from 'react';
import {useSession} from "next-auth/react";

const AlertContext = createContext();

export const AlertProvider = ({children}) => {
    const [alertMessage, setAlertMessage] = useState({type: '', text: ''});
    const {data: session, status} = useSession(); // Получаем сессию

    const clearAlertMessage = () => {
        setAlertMessage({type: '', text: ''});
    };
    const showAlertMessage = (newMessage) => {
        setAlertMessage(newMessage);
    };
    return (
        <div>
            {status !== 'loading' && session !== 'undefined' && (
                <AlertContext.Provider value={{alertMessage, clearAlertMessage, showAlertMessage}}>
                    {children}
                </AlertContext.Provider>
            )}
        </div>
    );
};

export const useAlert = () => {
    return useContext(AlertContext);
};
