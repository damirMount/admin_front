import React, {useState} from 'react';
import {Menu, MenuItem, Sidebar, SubMenu} from 'react-pro-sidebar';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars, faCode, faDisplay, faHome, faTimes} from "@fortawesome/free-solid-svg-icons";
import {faEnvelopeOpen, faFileLines, faFloppyDisk, faUser} from "@fortawesome/free-regular-svg-icons";
import {
    ACQUIRING_URL,
    DATABASE_UPDATE_INDEX_URL,
    DEALERS_ACCOUNT_HISTORY_REPORT_URL,
    DEALERS_TSJ_URL,
    GSFR_UPDATE_URL,
    MAIN_PAGE_URL,
    OLD_ADMIN_URL,
    RECIPIENT_INDEX_URL,
    REGISTRY_BACKUP_URL,
    REGISTRY_INDEX_URL,
    REGISTRY_LOGS_URL,
    REGISTRY_RESEND_URL,
    TEST_ZONE_URL
} from "../../routes/web";
import Link from "next/link";

const SidebarNavigation = () => {
    const [collapsed, setCollapsed] = useState(true);

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    const menuButtonList = [
        {label: 'Меню', hideWhereCollapsed: true},
        {label: 'Админ зона', link: `${OLD_ADMIN_URL}`, targetLink: '_blank', icon: faHome},
        {label: 'Главная', link: `${MAIN_PAGE_URL}`, icon: faDisplay},

        {label: 'Навигация', hideWhereCollapsed: true},
        {label: 'Обновление БД', link: `${DATABASE_UPDATE_INDEX_URL}`, icon: faFloppyDisk},
        {label: 'Реестры', icon: faEnvelopeOpen,
            subMenu: [
                {label: 'Получатели', link: `${RECIPIENT_INDEX_URL}`},
                {label: 'Реестры', link: `${REGISTRY_INDEX_URL}`,},
                {label: 'Перезапуск реестров', link: `${REGISTRY_RESEND_URL}`,},
                {label: 'Резервные копии', link: `${REGISTRY_BACKUP_URL}`,},
                {label: 'Логи', link: `${REGISTRY_LOGS_URL}`,},
            ]
        },
        {label: 'Отчёты', icon: faFileLines,
            subMenu: [
                {label: 'Дилеры',
                    subMenu: [
                        {label: 'История счетов', link: `${DEALERS_ACCOUNT_HISTORY_REPORT_URL}`},
                        {label: 'Дилеры ТСЖ', link: `${DEALERS_TSJ_URL}`,},
                    ]
                },
            ],
        },

        {EMPTY_ELEMENT: ''},
        {label: 'В Разработке', hideWhereCollapsed: true},
        {label: 'Разработка', icon: faCode,
            subMenu: [
                {label: 'TEST ZONE', link: `${TEST_ZONE_URL}`,},
                {label: 'Обновление ГСФР', link: `${GSFR_UPDATE_URL}`},
                {label: 'Эквайринг', link: `${ACQUIRING_URL}`,},
            ]
        },
    ];


    const buildSubMenu = (subMenuData, label, icon) => {
        if (!subMenuData) return null;

        return (
            <SubMenu label={label} title={label || ''}
                     icon={icon && <FontAwesomeIcon icon={icon} size="lg"/>}>
                {subMenuData.map((item, index) => (
                    item.subMenu ? // Добавлено условие для проверки наличия подменю
                        buildSubMenu(item.subMenu, item.label, item.icon) :
                        <MenuItem key={index} title={item.label}
                                  component={<Link href={item.link || '#'}/>}>{item.label || ''}</MenuItem>

                ))}
            </SubMenu>
        );
    };

// Функция для построения элемента меню
    const buildMenuItem = (item) => {
        const {label, link, icon, subMenu, targetLink, hideWhereCollapsed = false} = item;

        if (subMenu) {
            return buildSubMenu(subMenu, label, icon);
        } else {
            return (
                <MenuItem
                    title={label && !hideWhereCollapsed ? label : ''}
                    icon={icon && <FontAwesomeIcon icon={icon} size="lg"/>} // Прямое использование объекта иконки
                    component={<Link target={targetLink || ''} href={link || '#'}/>}
                    style={hideWhereCollapsed ? {opacity: collapsed ? 0 : 0.7, letterSpacing: '0.5px'} : {}}
                >{label || ''}
                </MenuItem>
            );
        }
    };

// Функция для построения всего меню
    const buildMenu = (menuButtonList) => {
        return menuButtonList.map((item, index) => (
            <React.Fragment key={index}>
                {buildMenuItem(item)}
            </React.Fragment>
        ));
    };


    const renderUserDetails = () => {
        if (!collapsed) {
            return (
                <MenuItem className="mb-1" suffix={<FontAwesomeIcon icon={faUser} size="lg"/>}>
                    <div className="d-flex flex-column">
                        <span className="fw-bold">Nikita</span>
                        <small className="text-nowrap"> Федеральный разработчик</small>
                    </div>
                </MenuItem>
            );
        }
        return null;
    };

    return (
        <Sidebar
            className='shadow user-select-none'
            backgroundColor="#ffffff"
            collapsed={collapsed}
            breakPoint="md"
            transitionDuration={0}
            onBackdropClick={toggleCollapsed}
            toggled={collapsed}
            collapsedWidth="80px"
        >
            <Menu
                className="position-fixed"
                style={{width: collapsed ? 80 : 249}}
                menuItemStyles={{
                    button: ({level, active, disabled}) => {
                        if (level === 0)
                            return {
                                color: disabled ? '#f5d9ff' : 'rgba(83,44,89,0.8)',
                                backgroundColor: active ? '#eecef9' : undefined,
                                height: 58
                            };
                    },
                }}
            >
                <div className="overflow-auto d-flex flex-column justify-content-between align-content-between"
                     style={{maxHeight: '100vh', minHeight: '100vh'}}>
                    <div className="h-100">
                        <MenuItem onClick={toggleCollapsed}
                                  title="Меню"
                                  icon={collapsed ? <FontAwesomeIcon icon={faBars} size="lg"/> :
                                      <FontAwesomeIcon icon={faTimes} size="lg"/>}>
                            Закрыть
                        </MenuItem>
                        {buildMenu(menuButtonList)}
                    </div>

                    {/*<div>*/}
                    {/*    {renderUserDetails()}*/}
                    {/*</div>*/}
                </div>
            </Menu>
        </Sidebar>
    );
};

export default SidebarNavigation;
