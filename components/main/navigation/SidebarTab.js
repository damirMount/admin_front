import React, {useState} from 'react';
import {Menu, MenuItem, Sidebar, SubMenu} from 'react-pro-sidebar';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars, faCode, faDisplay, faHome, faRotate, faShieldHalved, faTimes} from "@fortawesome/free-solid-svg-icons";
import {faEnvelopeOpen, faFileLines} from "@fortawesome/free-regular-svg-icons";
import Link from "next/link";
import {
    ACQUIRING_URL, DATA_UTILS_TEST_URL,
    GSFR_UPDATE_URL,
    MAIN_PAGE_URL,
    OFFLINE_SERVICE_DATABASE_UPDATE_INDEX_URL,
    OLD_ADMIN_URL,
    PERMISSION_INDEX_URL,
    RECIPIENT_INDEX_URL,
    REGISTRY_BACKUP_URL,
    REGISTRY_INDEX_URL,
    REGISTRY_LOGS_URL,
    REGISTRY_RESEND_URL,
    REPORT_DEALERS_ACCOUNT_HISTORY_URL,
    REPORT_DEALERS_TSJ_URL, REPORT_SERVICES_NORTH_ELECTRO_URL,
    ROLES_INDEX_URL,
    TEST_ZONE_URL
} from "../../../routes/web";
import {Tooltip} from "antd";
import ProtectedElement from "../system/ProtectedElement";
import UserDropdownMenu from "./UserDropdownMenu";

const SidebarTab = () => {
    const [collapsed, setCollapsed] = useState(true);
    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    const menuItemsList = [
        {label: 'Меню', hideWhereCollapsed: true},
        {label: 'Админ зона', link: OLD_ADMIN_URL, targetLink: '_blank', icon: faHome},
        {label: 'Главная', link: MAIN_PAGE_URL, icon: faDisplay},
        {label: 'Навигация', hideWhereCollapsed: true},
        {
            label: 'Реестры', permission: 'registry_management', icon: faEnvelopeOpen, showInSubMenu: true, subMenu: [
                {label: 'Получатели', link: RECIPIENT_INDEX_URL},
                {label: 'Реестры', link: REGISTRY_INDEX_URL},
                {label: 'Отправка реестра', link: REGISTRY_RESEND_URL},
                {label: 'Резервные копии', link: REGISTRY_BACKUP_URL},
                {label: 'Логи', link: REGISTRY_LOGS_URL}
            ]
        },
        {
            label: 'Отчёты', permission: 'reports_management', icon: faFileLines, showInSubMenu: true, subMenu: [
                {
                    label: 'Дилеры', permission: 'reports_dealer', subMenu: [
                        {label: 'История счетов', link: REPORT_DEALERS_ACCOUNT_HISTORY_URL},
                        {label: 'Дилеры ТСЖ', link: REPORT_DEALERS_TSJ_URL}
                    ]
                },
                {
                    label: 'Сервисы', subMenu: [
                        {label: 'Северэлектро', link: REPORT_SERVICES_NORTH_ELECTRO_URL},
                    ]
                }
            ]
        },
        {
            label: 'Обновления', permission: 'updates_management', icon: faRotate, showInSubMenu: true, subMenu: [
                {label: 'База Данных', permission: 'update_database', link: OFFLINE_SERVICE_DATABASE_UPDATE_INDEX_URL},
                {label: 'Список ГСФР', permission: 'update_gsfr', link: GSFR_UPDATE_URL}
            ]
        },
        {
            label: 'Безопасность',
            permission: 'security_management',
            icon: faShieldHalved,
            showInSubMenu: true,
            subMenu: [
                {
                    label: 'Права доступа', permission: 'access_management', subMenu: [
                        {label: 'Список ролей', link: ROLES_INDEX_URL},
                        {label: 'Лист разрешений', link: PERMISSION_INDEX_URL},
                    ],
                },
                // {label: 'Журнал аудита', link: TEST_ZONE_URL},
            ]
        },
        {label: 'В Разработке', permission: 'develop', hideWhereCollapsed: true},
        {
            label: 'Разработка', permission: 'develop', icon: faCode, showInSubMenu: true, subMenu: [
                {label: 'TEST ZONE', link: TEST_ZONE_URL},
                {label: 'Эксель тест', link: DATA_UTILS_TEST_URL},
                {label: 'Эквайринг', link: ACQUIRING_URL},
            ]
        }
    ];

    const buildSubMenu = (subMenuData, label, icon, showInSubMenu, permission) => {

        const subMenuItemContent = (
            <Tooltip placement="right" {...((label && collapsed && showInSubMenu) ? {title: label} : {})}>
                <SubMenu label={label} icon={icon && <FontAwesomeIcon icon={icon} size="lg"/>}>
                    {showInSubMenu && collapsed && (
                        <MenuItem title={label} className='fw-bold border-bottom text-nowrap'
                                  icon={icon && <FontAwesomeIcon icon={icon} size="lg"/>}>
                            {label || ''}
                        </MenuItem>
                    )}
                    {subMenuData.map((item, index) => (
                        item.subMenu ?
                            buildSubMenu(item.subMenu, item.label, item.icon, item.targetLink)
                            :
                            buildMenuItem(item)
                    ))}
                </SubMenu>
            </Tooltip>
        );

        if (permission) {
            return (
                <ProtectedElement allowedPermissions={permission} redirect={false}>
                    {subMenuItemContent}
                </ProtectedElement>
            );
        } else {
            return subMenuItemContent;
        }
    };

    const buildMenuItem = (item) => {
        const {label, link, icon, permission, showInSubMenu, subMenu, targetLink, hideWhereCollapsed = false} = item;

        if (subMenu) {
            return buildSubMenu(subMenu, label, icon, showInSubMenu, permission);
        } else {
            const menuItemContent = (
                <Tooltip placement="right" {...((label && collapsed && !hideWhereCollapsed) ? {title: label} : {})}>
                    <MenuItem
                        icon={icon && <FontAwesomeIcon icon={icon} size="lg"/>}
                        component={link ? <Link href={link} target={targetLink || ''}/> : null}
                        style={hideWhereCollapsed ? {opacity: collapsed ? 0 : 0.7, letterSpacing: '0.5px'} : {}}
                    >
                        {label || ''}
                    </MenuItem>
                </Tooltip>
            );

            if (permission) {
                return (
                    <ProtectedElement allowedPermissions={permission} redirect={false}>
                        {menuItemContent}
                    </ProtectedElement>
                );
            } else {
                return menuItemContent;
            }
        }
    };


    const buildMenu = (menuItemsList) => {
        return menuItemsList.map((item, index) => (
            <React.Fragment key={index}>
                {buildMenuItem(item)}
            </React.Fragment>
        ));
    };


    return (
        <Sidebar className='shadow user-select-none' backgroundColor="#ffffff" collapsed={collapsed}
                 breakPoint="none" transitionDuration={90} onBackdropClick={toggleCollapsed} toggled={collapsed}
                 collapsedWidth="80px">
            <Menu className="position-fixed" style={{width: collapsed ? 80 : 249}} menuItemStyles={{
                button: ({level, active, disabled}) => {
                    if (level === 0)
                        return {
                            color: disabled ? '#f5d9ff' : 'rgba(83,44,89,0.8)',
                            backgroundColor: active ? '#aaaaaa' : undefined,
                            height: 59,
                        };
                },
            }}>
                <div className='d-flex flex-column justify-content-between sidebar-menu-body'>
                    <div className="overflow-auto d-flex flex-column justify-content-between align-content-between">
                        <div className="h-100">
                            <MenuItem onClick={toggleCollapsed}
                                      icon={collapsed ? <FontAwesomeIcon icon={faBars} size="lg"/> :
                                          <FontAwesomeIcon icon={faTimes} size="lg"/>}>
                                Закрыть
                            </MenuItem>
                            {buildMenu(menuItemsList)}
                        </div>
                    </div>
                    {UserDropdownMenu(collapsed)}
                </div>
            </Menu>
        </Sidebar>
    );
};

export default SidebarTab;
