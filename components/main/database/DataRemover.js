// ModalWindow.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useModal } from '../../contexts/ModalContext';

const ModalWindow = () => {
    const { showModal, closeModal, modalData } = useModal();

    return (
        <Modal show={showModal} onHide={closeModal}>
            <Modal.Header closeButton>
                <Modal.Title>Modal title</Modal.Title>
            </Modal.Header>
            <Modal.Body>{modalData}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={closeModal}>
                    Отмена
                </Button>
                <Button variant="primary">Save changes</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalWindow;
