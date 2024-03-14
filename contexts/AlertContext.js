import React, {createContext, useContext} from 'react';
import {useSession} from "next-auth/react";
import {notification} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckCircle, faTriangleExclamation, faXmark} from "@fortawesome/free-solid-svg-icons";

const AlertContext = createContext();
export const AlertProvider = ({children}) => {
    const {data: session, status} = useSession(); // Получаем сессию

    const CustomNotification = ({message, messageType, notificationKey}) => (
        <div className="toast d-block" role="alert" aria-live="assertive" aria-atomic="true">
            <div className={`w-100 d-flex justify-content-between toast-header bg-${messageType} text-white`}>
                {messageType === 'success' ? (
                    <div>
                        <FontAwesomeIcon className="fs-5 me-2" icon={faCheckCircle} size="xl"/>
                        <strong> Успех! </strong>
                    </div>
                ) : (
                    <div>
                        <FontAwesomeIcon className="fs-5 me-2" icon={faTriangleExclamation} size="xl"/>
                        <strong> Ошибка!! </strong>
                    </div>
                )}
                <button
                    type="button"
                    className="btn btn-sm text-white d-flex close-alert"
                    onClick={() => notification.destroy(notificationKey)} // Используйте метод close у объекта api
                >
                    <FontAwesomeIcon className="fs-5 " icon={faXmark} size="xl"/>
                </button>
            </div>
            <div className="toast-body">{message}</div>
        </div>
    );

    const openNotification = ({message, type}) => {
        const notificationKey = `notification_${Date.now()}`;
        const messageType = type === 'success' ? type : 'danger';
        notification.open({
            key: notificationKey,
            duration: 10,
            description: <CustomNotification message={message} messageType={messageType}
                                             notificationKey={notificationKey}/>,
            closeIcon: null,
            placement: 'bottomRight'
        });
    };

    return (
        <div>
            {status !== 'loading' && session !== 'undefined' && (
                <AlertContext.Provider value={{openNotification}}>
                    {children}
                </AlertContext.Provider>
            )}
        </div>
    );
};

export const useAlert = () => {
    return useContext(AlertContext);
};
