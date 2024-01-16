// DataRemover.js
import React, {useState} from 'react';
import ModalWindow from '../ModalWindow';
import {parseCookies} from "nookies";

const DataRemover = ({id, deleteRoute}) => {
    const [modalData, setModalData] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const handleRemoveData = () => {
        const newModalData = {
            title: 'Подтвердите удаление',
            message: `Вы уверены что вы хотите удалить запись с ID ${id}?`,
            button: 'Удалить',
            buttonVariant: `danger`,
        };

        setModalData(newModalData);
        setShowModal(true); // Открываем модальное окно
    };

    const handleDelete = async () => {
        if (modalData) {
            try {
                const cookies = parseCookies();
                const authToken = JSON.parse(cookies.authToken).value;
                await fetch(`${deleteRoute}/${id}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                window.location.reload();
                setShowModal(false);
            } catch (error) {
                console.error('Error deleting data:', error);
            }
        }
    };

    return (
        <>
            <button
                className="dropdown-item d-flex align-items-center"
                onClick={handleRemoveData}
            >
                Удалить
            </button>
            <ModalWindow
                showModal={showModal} // Передаем состояние модального окна
                closeModal={() => setShowModal(false)} // Передаем функцию для закрытия модального окна
                data={modalData}
                onHandle={handleDelete} // Передаем функцию для вызова при нажатии на кнопку в модальном окне
            />
        </>
    );
};

export default DataRemover;
