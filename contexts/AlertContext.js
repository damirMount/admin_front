// В AlertContext.js

import React, {createContext, useContext, useState} from 'react';

const AlertContext = createContext();

export const AlertProvider = ({children}) => {
    const [alertMessage, setAlertMessage] = useState({type: '', text: ''});

    const clearAlertMessage = () => {
        setAlertMessage({type: '', text: ''});
    };

    const showAlertMessage = (newMessage) => {
        setAlertMessage(newMessage);
    };

    return (
        <AlertContext.Provider value={{alertMessage, clearAlertMessage, showAlertMessage}}>
            {children}
        </AlertContext.Provider>
    );
};

export const useAlert = () => {
    return useContext(AlertContext);
};
