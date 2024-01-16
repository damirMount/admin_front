// ModalContext.js
import React, {createContext, useContext, useState} from 'react';

const ModalContext = createContext();

export const ModalProvider = ({children}) => {
    const [modalData, setModalData] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const openModal = (data) => {
        setModalData(data);
        setShowModal(true);
    };

    const closeModal = () => {
        setModalData(null);
        setShowModal(false);
    };

    return (
        <ModalContext.Provider value={{showModal, openModal, closeModal, modalData}}>
            {children}
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    return useContext(ModalContext);
};
