import React, { useEffect } from 'react';
import { faCheckCircle, faTriangleExclamation, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Alert = ({ alertMessage, clearAlertMessage }) => {
    const messageType = alertMessage.type === "success" ? alertMessage.type : 'danger';

    useEffect(() => {
        const timer = setTimeout(() => {
            clearAlertMessage();
        }, 30000);

        return () => clearTimeout(timer);
    }, [alertMessage, clearAlertMessage]);

    return (
        <div id="alert">
            {alertMessage.text && (
                <div>
                    <div className={`toast d-block z-1 mb-3 position-fixed start-0 bottom-0 m-4`} role="alert">
                        <div className={`w-100 d-flex justify-content-between toast-header bg-${messageType} text-white`}>
                            {messageType === 'success' ? (
                                <div>
                                    <FontAwesomeIcon className="fs-5 me-2" icon={faCheckCircle} size="xl" />
                                    <strong> Успех! </strong>
                                </div>
                            ) : (
                                <div>
                                    <FontAwesomeIcon className="fs-5 me-2" icon={faTriangleExclamation} size="xl" />
                                    <strong> Ошибка!! </strong>
                                </div>
                            )}

                            <button
                                type="button"
                                className="btn btn-sm text-white d-flex close-alert"
                                data-bs-dismiss="toast"
                                aria-label="Close"
                                onClick={clearAlertMessage}
                            >
                                <FontAwesomeIcon className="fs-5 " icon={faXmark} size="xl" />
                            </button>
                        </div>
                        <div className="toast-body" id="message-body">
                            {alertMessage.text}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Alert;
