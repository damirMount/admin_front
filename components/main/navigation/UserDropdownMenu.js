import {useRouter} from "next/router";
import {signOut, useSession} from "next-auth/react";
import {LOGIN_PAGE_URL} from "../../../routes/web";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowRightFromBracket} from "@fortawesome/free-solid-svg-icons";
import {Dropdown} from "antd";
import {MenuItem} from "react-pro-sidebar";
import {faUser} from "@fortawesome/free-regular-svg-icons";
import React, {useState} from "react";
import ModalWindow from "../system/ModalWindow";

const UserDropdownMenu = (collapsed) => {
    const router = useRouter();
    const {data: session} = useSession(); // Получаем сессию
    const [modalData, setModalData] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const handleSignOut = async () => {
        await signOut();
        await router.replace(LOGIN_PAGE_URL); // Перенаправление на страницу логина после выхода
    };

    const handleOk = () => {
        const newModalData = {
            title: 'Подтвердите действие',
            message: `Вы уверены что вы хотите выйти?`,
            button: 'Выйти',
            buttonVariant: `purple`,
        };

        setModalData(newModalData);
        setShowModal(true); // Открываем модальное окно

    };

    const items = [
        {
            label: !collapsed ? 'Выйти из админ зоны' : <FontAwesomeIcon icon={faArrowRightFromBracket}/>,
            onClick: handleOk,
            autoFocus: true,
            icon: !collapsed ? <FontAwesomeIcon icon={faArrowRightFromBracket}/> : '',
            key: '0',
        },
    ];

    if (session) {
        return (
            <div className='sidebar-user-dropdown-menu'>
                <ModalWindow
                    showModal={showModal} // Передаем состояние модального окна
                    closeModal={() => setShowModal(false)} // Передаем функцию для закрытия модального окна
                    data={modalData}
                    onHandle={handleSignOut} // Передаем функцию для вызова при нажатии на кнопку в модальном окне
                />
                <Dropdown
                    menu={{items}}
                    trigger={['click']}
                    overlayClassName='sidebar-user-dropdown position-fixed text-center'
                >
                    <span>
                        <MenuItem className='bottom-0 border-top'
                                  suffix={!collapsed && (<FontAwesomeIcon icon={faUser} size="lg"/>)}>

                            {!collapsed ? (
                                <div className="d-flex flex-column">
                                    <span className="fw-bold text-overflow"
                                          title={session.user.name}>{session.user.name}</span>
                                    <small className="text-overflow"
                                           title={session.user.role}>{session.user.role}</small>
                                </div>
                            ) : (
                                <div className="d-flex flex-column w-100">
                                    <FontAwesomeIcon icon={faUser} size="lg"/>
                                </div>)}

                            </MenuItem>
                    </span>
                </Dropdown>
            </div>
        );
    }
    return null;
}

export default UserDropdownMenu
