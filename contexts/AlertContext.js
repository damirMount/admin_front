import React, {createContext, useContext, useEffect, useState} from 'react';
import {useSession} from "next-auth/react";
import {message, notification} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleExclamation, faTriangleExclamation, faXmark} from "@fortawesome/free-solid-svg-icons";

const AlertContext = createContext();
export const AlertProvider = ({children}) => {
    const {data: session, status} = useSession(); // Получаем сессию
    const [messageApi, contextHolder] = message.useMessage();

    const CustomNotification = ({message, notificationKey}) => (
        <div className="toast d-block" role="alert" aria-live="assertive" aria-atomic="true">
            <div className={`w-100 d-flex justify-content-between toast-header bg-danger text-white`}>
                <div>
                    <FontAwesomeIcon className="fs-5 me-2" icon={faTriangleExclamation} size="xl"/>
                    <strong> Ошибка!! </strong>
                </div>
                <button
                    type="button"
                    className="btn btn-sm text-white d-flex close-alert"
                    onClick={() => notification.destroy(notificationKey)}
                >
                    <FontAwesomeIcon className="fs-5 " icon={faXmark} size="xl"/>
                </button>
            </div>
            <div className="toast-body">{message}</div>
        </div>
    );


    const openNotification = ({message, type}) => {
        if (type === 'success') {
            messageApi.open({
                type: 'success',
                content: message,
                className: 'mt-5'
            });
        } else {
            const notificationKey = `notification_${Date.now()}`;
            notification.open({
                key: notificationKey,
                duration: 10,
                description: <CustomNotification
                    message={message}
                    notificationKey={notificationKey}/>,
                closeIcon: null,
                placement: 'bottomRight'
            });
        }
    }

    const CustomConfirmAction = ({ onSave, onReset, onClose }) => {
        return (
            <div
                className="toast d-flex flex-column"
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                style={{ width: "45vw" }}
            >
                <div
                    className={`w-100 d-flex justify-content-between align-items-center toast-body color-purple bg-primary-subtle`}
                >
                    <div className="d-flex align-items-center">
                        <FontAwesomeIcon
                            className="fs-5 me-3"
                            icon={faCircleExclamation}
                            size="xl"
                        />
                        <strong>
                            Осторожней! <br /> У вас есть не сохранённые изменения!{" "}
                        </strong>
                    </div>
                    <div className="d-flex">
                        <button
                            type="button"
                            className="btn btn-purple"
                            onClick={() => {
                                onSave(); // Вызываем функцию onSave при нажатии на кнопку "Сохранить"
                                onClose(); // Закрываем оповещение
                            }}
                        >
                            Сохранить
                        </button>
                        <button
                            type="button"
                            className="btn btn-grey ms-3"
                            onClick={() => {
                                onReset(); // Вызываем функцию onSave при нажатии на кнопку "Сохранить"
                                onClose(); // Закрываем оповещение
                            }}
                        >
                            Сбросить
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const openConfirmAction = ({onSave, onReset}) => {
            const notificationKey = `confirm_action`;
            const onClose = () => {
                notification.destroy(notificationKey);
            };

                notification.open({
                    key: notificationKey,
                    duration: null,
                    description: (
                        <CustomConfirmAction onSave={onSave} onReset={onReset} onClose={onClose}/>
                    ),
                    closeIcon: null,
                    placement: "bottom",
                });
    };

    const closeConfirmAction = () => {
        notification.destroy('confirm_action');
    };

    return (
        <div>
            {status !== 'loading' && session !== 'undefined' && (
                <AlertContext.Provider value={{openNotification, openConfirmAction, closeConfirmAction}}>
                    {contextHolder}
                    {children}
                </AlertContext.Provider>
            )}
        </div>
    );
};

export const useAlert = () => {
    return useContext(AlertContext);
};
