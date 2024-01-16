// ModalWindow.js
import React from 'react';
import {Button, Modal} from 'react-bootstrap';

const ModalWindow = ({showModal, closeModal, data, onHandle}) => {

    if (data == null) {
        return null
    }

    return (
        <Modal show={showModal} onHide={closeModal}>
            <Modal.Header closeButton>
                <Modal.Title>{data.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{data.message}</Modal.Body>
            <Modal.Footer>
                <Button variant={data.buttonVariant} onClick={onHandle}>
                    {data.button}
                </Button>
                <Button variant="secondary" onClick={closeModal}>
                    Отмена
                </Button>

            </Modal.Footer>
        </Modal>
    );
};

export default ModalWindow;
