import React, {useState} from 'react';
import {Menu, MenuItem, Sidebar, SubMenu} from 'react-pro-sidebar';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars, faCode, faDisplay, faHome, faRotate, faShieldHalved, faTimes} from "@fortawesome/free-solid-svg-icons";
import {faEnvelopeOpen, faFileLines, faUser} from "@fortawesome/free-regular-svg-icons";
import Link from "next/link";
import {
    ACQUIRING_URL,
    GSFR_UPDATE_URL,
    MAIN_PAGE_URL,
    OFFLINE_SERVICE_DATABASE_UPDATE_INDEX_URL,
    OLD_ADMIN_URL,
    RECIPIENT_INDEX_URL,
    REGISTRY_BACKUP_URL,
    REGISTRY_INDEX_URL,
    REGISTRY_LOGS_URL,
    REGISTRY_RESEND_URL,
    REPORT_DEALERS_ACCOUNT_HISTORY_URL,
    REPORT_DEALERS_TSJ_URL,
    SECURITY_ACCESS_PERMISSION_INDEX,
    SECURITY_ACCESS_ROLES_INDEX,
    SECURITY_ACCESS_USERS_LIST,
    TEST_ZONE_URL
} from "../../../routes/web";
import {useSession} from "next-auth/react";

const SidebarTab = () => {
    const [collapsed, setCollapsed] = useState(true);
    const {data: session} = useSession(); // Получаем сессию
    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    const menuButtonList = [
        {label: 'Меню', hideWhereCollapsed: true},
        {label: 'Админ зона', link: OLD_ADMIN_URL, targetLink: '_blank', icon: faHome},
        {label: 'Главная', link: MAIN_PAGE_URL, icon: faDisplay},
        {label: 'Навигация', hideWhereCollapsed: true},
        {
            label: 'Реестры', icon: faEnvelopeOpen, showInSubMenu: true, subMenu: [
                {label: 'Получатели', link: RECIPIENT_INDEX_URL},
                {label: 'Реестры', link: REGISTRY_INDEX_URL},
                {label: 'Перезапуск реестров', link: REGISTRY_RESEND_URL},
                {label: 'Резервные копии', link: REGISTRY_BACKUP_URL},
                {label: 'Логи', link: REGISTRY_LOGS_URL}
            ]
        },
        {
            label: 'Отчёты', icon: faFileLines, showInSubMenu: true, subMenu: [
                {
                    label: 'Дилеры', subMenu: [
                        {label: 'История счетов', link: REPORT_DEALERS_ACCOUNT_HISTORY_URL},
                        {label: 'Дилеры ТСЖ', link: REPORT_DEALERS_TSJ_URL}
                    ]
                }
            ]
        },
        {
            label: 'Обновления', icon: faRotate, showInSubMenu: true, subMenu: [
                {label: 'База Данных', link: OFFLINE_SERVICE_DATABASE_UPDATE_INDEX_URL},
                {label: 'Список ГСФР', link: GSFR_UPDATE_URL}
            ]
        },
        {
            label: 'Безопасность', icon: faShieldHalved, showInSubMenu: true, subMenu: [
                {
                    label: 'Права доступа', subMenu: [
                        {label: 'Список пользователей', link: SECURITY_ACCESS_USERS_LIST},
                        {label: 'Список ролей', link: SECURITY_ACCESS_ROLES_INDEX},
                        {label: 'Список прав', link: SECURITY_ACCESS_PERMISSION_INDEX},
                    ],
                },
                // {label: 'Журнал аудита', link: TEST_ZONE_URL},
            ]
        },
        {label: 'В Разработке', hideWhereCollapsed: true},
        {
            label: 'Разработка', icon: faCode, showInSubMenu: true, subMenu: [
                {label: 'TEST ZONE', link: TEST_ZONE_URL},
                {label: 'Эквайринг', link: ACQUIRING_URL},
            ]
        }
    ];

    const buildSubMenu = (subMenuData, label, icon, showInSubMenu) => {
        if (!subMenuData) return null;

        return (
            <SubMenu label={label} title={label || ''} icon={icon && <FontAwesomeIcon icon={icon} size="lg"/>}>
                {showInSubMenu && collapsed && (
                    <MenuItem title={label} className='fw-bold border-bottom text-nowrap'
                              icon={icon && <FontAwesomeIcon icon={icon} size="lg"/>}>
                        {label || ''}
                    </MenuItem>
                )}
                {subMenuData.map((item, index) => (
                    item.subMenu ?
                        buildSubMenu(item.subMenu, item.label, item.icon, item.targetLink) :
                        <MenuItem
                            key={index}
                            title={item.label}
                            icon={item.icon && <FontAwesomeIcon icon={item.icon} size="lg"/>}
                            component={
                                item.link ? <Link href={item.link} target={item.targetLink || ''}/> : null
                            }>
                            {item.label || ''}
                        </MenuItem>
                ))}
            </SubMenu>
        );
    };

    const buildMenuItem = (item) => {
        const {label, link, icon, showInSubMenu, subMenu, targetLink, hideWhereCollapsed = false} = item;

        if (subMenu) {
            return buildSubMenu(subMenu, label, icon, showInSubMenu);
        } else {
            return (
                <MenuItem
                    title={label && !hideWhereCollapsed ? label : ''}
                    icon={icon && <FontAwesomeIcon icon={icon} size="lg"/>}
                    component={
                        link ? <Link href={link} target={targetLink || ''}/> : null
                    }
                    style={hideWhereCollapsed ? {opacity: collapsed ? 0 : 0.7, letterSpacing: '0.5px'} : {}}
                >{label || ''}
                </MenuItem>
            );
        }
    };

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
                <MenuItem className='bottom-0 border-top' suffix={<FontAwesomeIcon icon={faUser} size="lg"/>}>
                    <div className="d-flex flex-column">
                        <span className="fw-bold text-overflow" title={session.user.name}>{session.user.name}</span>
                        <small className="text-overflow" title={session.user.role}>{session.user.role}</small>
                    </div>
                </MenuItem>
            );
        }
        return null;
    };

    return (
        <Sidebar className='shadow user-select-none' backgroundColor="#ffffff" collapsed={collapsed}
                 breakPoint="none" transitionDuration={0} onBackdropClick={toggleCollapsed} toggled={collapsed}
                 collapsedWidth="80px">
            <Menu className="position-fixed " style={{width: collapsed ? 80 : 249}} menuItemStyles={{
                button: ({level, active, disabled}) => {
                    if (level === 0)
                        return {
                            color: disabled ? '#f5d9ff' : 'rgba(83,44,89,0.8)',
                            backgroundColor: active ? '#aaaaaa' : undefined,
                            height: 58,
                        };
                },
            }}>
                <div className='d-flex flex-column justify-content-between'
                     style={{maxHeight: '100vh', minHeight: '100vh'}}>
                    <div className="overflow-auto d-flex flex-column justify-content-between align-content-between">
                        <div className="h-100">
                            <MenuItem onClick={toggleCollapsed} title="Меню"
                                      icon={collapsed ? <FontAwesomeIcon icon={faBars} size="lg"/> :
                                          <FontAwesomeIcon icon={faTimes} size="lg"/>}>
                                Закрыть
                            </MenuItem>
                            {buildMenu(menuButtonList)}
                        </div>
                    </div>
                    <div style={{height: '10%'}}>
                        {renderUserDetails()}
                    </div>
                </div>
            </Menu>
        </Sidebar>
    );
};

export default SidebarTab;
