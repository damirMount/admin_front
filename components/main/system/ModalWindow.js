import React from 'react';
import {Button, Divider, Modal, Typography} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleExclamation} from "@fortawesome/free-solid-svg-icons";

const ModalWindow = ({showModal, closeModal, data, onHandle}) => {

    if (data == null) {
        return null
    }
    const {Text, Title} = Typography;
    return (
        <Modal title={
            <>
                <FontAwesomeIcon
                    className='color-purple me-2'
                    size="lg"
                    icon={faCircleExclamation}
                />
                {data.title}
            </>
        }
               open={showModal}
               onCancel={closeModal}
               footer={[
                   <Button key="back" onClick={closeModal}>
                       Отмена
                   </Button>,
                   <Button key="submit" type="primary" onClick={() => {
                       onHandle()
                       closeModal()
                   }}>
                       Подтвердить
                   </Button>,
               ]}
        >
            <Divider/>
            <span
                dangerouslySetInnerHTML={{
                    __html: data.message || '',
                }}
            />
            <Divider/>
        </Modal>
    );
};

export default ModalWindow;
