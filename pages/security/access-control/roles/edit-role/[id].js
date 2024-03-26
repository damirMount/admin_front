import React, {useEffect, useState} from 'react';
import {ROLE_SHOW_API, ROLE_UPDATE_API} from '../../../../../routes/api';
import Head from 'next/head';
import {useAlert} from '../../../../../contexts/AlertContext';
import {useSession} from 'next-auth/react';
import {useRouter} from 'next/router';
import Preloader from '../../../../../components/main/system/Preloader';
import {Divider, Empty, Switch} from 'antd';
import fetchData from '../../../../../components/main/database/DataFetcher';
import FormInput from "../../../../../components/main/input/FormInput";
import SmartTable from "../../../../../components/main/table/SmartTable";
import SearchByColumn from "../../../../../components/main/table/cell/SearchByColumn";
import {isEqual} from "lodash";

export default function UpdatePermission() {
    const [formData, setFormData] = useState({
        name: '',
        permissions: [],
    });
    const [updatedFormData, setUpdatedFormData] = useState({...formData});
    const router = useRouter();
    const {openNotification, openConfirmAction, closeConfirmAction} = useAlert();
    const {data: session} = useSession(); // Получаем сессию
    const [itemId, setItemId] = useState(Number(router.query.id));

    const [isLoading, setIsLoading] = useState(true);
    const [permissionsList, setPermissionsList] = useState([]);
    const [rolesList, setRolesList] = useState([]);

    const handleInputChange = (e) => {
        const inputValue = e.target.value;
        const inputName = e.target.name;

        setUpdatedFormData((prevFormData) => {
            const updatedData = {
                ...prevFormData,
                [inputName]: inputValue,
            };

            if (!isEqual(updatedData, formData)) {
                openConfirmAction({onSave: () => handleSave(updatedData), onReset: handleReset});
            } else {
                closeConfirmAction();
            }

            return updatedData;
        });
    };


    const permissionSelect = (checked, name) => {
        setUpdatedFormData((prevFormData) => {
            let updatedPermissions;
            if (checked) {
                // Проверяем, есть ли разрешение уже в списке permissions
                if (!prevFormData.permissions.includes(name)) {
                    updatedPermissions = [...prevFormData.permissions, name]; // Добавляем разрешение
                }
            } else {
                updatedPermissions = prevFormData.permissions.filter(permission => permission !== name); // Удаляем разрешение
            }

            // Проверяем, изменилось ли значение для данного разрешения
            const isPermissionChanged = !isEqual(updatedPermissions, formData.permissions);


            if (isPermissionChanged) {
                const updatedData = {...prevFormData, permissions: updatedPermissions};
                openConfirmAction({onSave: () => handleSave(updatedData), onReset: handleReset});
            } else {
                closeConfirmAction();
            }

            return {...prevFormData, permissions: updatedPermissions}; // Возвращаем обновленные данные
        });
    };


    const handleSubmit = async (updatedData) => {
        try {
            const response = await fetch(`${ROLE_UPDATE_API}/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.accessToken}`,
                },
                body: JSON.stringify(updatedData),
            });

            const responseData = await response.json();
            if (response.ok) {
                fetchRoles()
                openNotification({type: 'success', message: responseData.message});
            } else {
                openNotification({type: 'error', message: responseData.message});
            }
        } catch (error) {
            openNotification({type: 'error', message: error.message});
        }
    };


    const fetchRoleItem = async () => {
        try {
            const response = await fetch(`${ROLE_SHOW_API}/${itemId}`, {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            });
            const responseData = await response.json();
            if (response.ok) {
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    name: responseData.name,
                    permissions: responseData.permissions.map((item) => item.id)
                }));

                setUpdatedFormData((prevFormData) => ({
                    ...prevFormData,
                    name: responseData.name,
                    permissions: responseData.permissions.map((item) => item.id)
                }));
            } else {
                openNotification({type: 'error', message: responseData.message});
                console.error('Ошибка при загрузке данных с API');
            }
        } catch (error) {
            openNotification({type: 'error', message: error.message});
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPermissions = async () => {
        try {
            const fetchPermissionsConfig = {
                model: 'Permission',
            };

            const data = await fetchData(fetchPermissionsConfig, session);
            if (data) {
                setPermissionsList(data.data);
            }
        } catch (error) {
            openNotification({
                type: 'error',
                message: 'Ошибка при получении данных: ' + error.message,
            });
        }
    };

    const fetchRoles = async () => {
        try {
            const fetchRolesConfig = {
                model: 'Role',
                sort: '{"column":"id","direction":"desc"}',
            };

            const data = await fetchData(fetchRolesConfig, session);
            if (data) {
                setRolesList(data.data);
            }
        } catch (error) {
            openNotification({
                type: 'error',
                message: 'Ошибка при получении данных: ' + error.message,
            });
        }
    };

    useEffect(() => {
        setIsLoading(true)
        fetchRoles();
        fetchPermissions();
        if (itemId !== null && itemId !== undefined) {
            fetchRoleItem();
            setIsLoading(true)
        }

    }, [itemId]);

    const handleSave = (updatedData) => {
        setFormData(updatedData);
        handleSubmit(updatedData);
    };

    const handleReset = () => {
        setUpdatedFormData(formData);
    };

    useEffect(() => {
        // Функция, которая закрывает окно подтверждения действия после перехода на другую страницу
        return () => {
            closeConfirmAction()
        };
    }, []);

    return (
        <div>
            <Head>
                <title>Редактировать разрешения для роли | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div>
                <h1>Редактировать разрешения для роли</h1>
                <form onSubmit={handleSubmit}>
                    <div className="container  d-flex">
                        <div className="container mt-2">
                            <div className='d-flex  justify-content-between'>
                                <div className='w-25'>
                                    <SmartTable
                                        data={rolesList}
                                        paginationPosition={['none']}
                                        columns={[
                                            {
                                                title: 'Роли',
                                                dataIndex: 'name',
                                                ...SearchByColumn('name'),
                                            }
                                        ]}
                                        onRow={(record) => ({
                                            onClick: () => {
                                                setItemId(record.id);
                                                closeConfirmAction()
                                            },
                                            className: `cursor-pointer user-select-none ${record.id === itemId ? 'btn-cancel' : ''}`
                                        })}
                                    />
                                </div>
                                <div className='border-end ms-3 mt-3 me-4'></div>
                                <div className='w-75 h-100' key={itemId}>

                                    {isLoading ? (
                                        <Preloader/>

                                    ) : (
                                        <div className='mt-3'>
                                            <h5>Основное </h5>
                                            <div className='mt-3'>
                                                <FormInput
                                                    input="input"
                                                    type="text"
                                                    label="Название"
                                                    className="input-field"
                                                    id="name"
                                                    placeholder="Название"
                                                    name="name"
                                                    defaultValue={formData.name}
                                                    value={updatedFormData.name}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                                <div
                                                    className='mt-3 d-flex flex-column w-100 h-100 justify-content-center'>
                                                    <Divider><span
                                                        className="text-nowrap">Права доступа</span></Divider>
                                                    {permissionsList.length > 0 ? (
                                                        permissionsList.map((item, index) => (
                                                            <div className='w-100' key={index}>
                                                                <div
                                                                    className="d-flex w-100 justify-content-between mb-2 align-items-center">
                                                                    <h5>{item.title}</h5>
                                                                    <Switch
                                                                        value={updatedFormData.permissions.some(permission => permission === item.id)}
                                                                        defaultChecked={formData.permissions.some(permission => permission === item.id)}
                                                                        onChange={(checked) => permissionSelect(checked, item.id)}
                                                                    />
                                                                </div>
                                                                <p>{item.description}</p>
                                                                <Divider/>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/*<div className="w-100 mt-5 mb-5 d-flex justify-content-center">*/}
                            {/*    <button className="btn btn-purple me-2" type="submit">*/}
                            {/*        Сохранить*/}
                            {/*    </button>*/}
                            {/*    <Link href={ROLES_INDEX_URL} className="btn btn-cancel ms-2" type="button">*/}
                            {/*        Отмена*/}
                            {/*    </Link>*/}
                            {/*</div>*/}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
