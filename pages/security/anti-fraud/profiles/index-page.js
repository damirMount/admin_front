import React, {useMemo, useState} from "react";
import Head from "next/head";
import {Badge, Card, Form, Space, Tag, theme, Typography} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClock} from "@fortawesome/free-regular-svg-icons";
import {useSession} from "next-auth/react";
import dayjs from "dayjs";

import SmartTable from "../../../../components/main/table/SmartTable";
import ProtectedElement from "../../../../components/main/system/ProtectedElement";
import {useAlert} from "../../../../contexts/AlertContext";
import ProfileDetails from "./components/ProfileDetails/ProfileDetails";

import useAntiFraudProfiles from "./hooks/useAntiFraudProfiles";
import FilterForm from "./components/FilterForm";
import ActionButtons from "../../../../components/main/table/cell/ActionButtons";
import {prepareFormValues} from "../../../../components/pages/security/anti-fraud/helpers";
import {USERS_TRUST_STATUS} from "../../../../components/pages/security/anti-fraud/constants";
import EditProfileModal from "./components/EditProfileModal";
import useAntiFraudProfileActions from "./hooks/useAntiFraudProfileActions";

const {Text, Title} = Typography;

export default function AntiFraudProfilePage() {
    const {token} = theme.useToken();
    const {openNotification} = useAlert();
    const {data: session} = useSession();
    const [form] = Form.useForm();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null); // Добавили стейт для хранения данных клиента
    const [openDropdownId, setOpenDropdownId] = useState(null);

    const {historyData, loading, dictionaries, getHistory} = useAntiFraudProfiles(session, openNotification);
    const {handleSaveProfile} = useAntiFraudProfileActions(session, openNotification, getHistory);

    const onSave = async (values) => {
        if (typeof handleSaveProfile === 'function') {
            await handleSaveProfile({id: editingClient?.id, ...values}, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setEditingClient(null);
                }
            });
        }
    };
    const [pagination, setPagination] = useState(
        {
            current: 1,
            pageSize: 100
        }
    );

    const columns = useMemo(
        () => {
            return [
                {
                    title: "№",
                    width: 50,
                    align: "center",
                    render: (_, __, index) => {
                        return (pagination.current - 1) * pagination.pageSize + index + 1;
                    }
                },
                {
                    title: "ID Клиента",
                    dataIndex: "id",
                    width: "100px",
                    render: (id, profile) => {
                        return (
                            <Space direction="vertical" size={0}>
                                <Text copyable strong style={{color: token.colorPrimary}}>
                                    {id}
                                </Text>
                                <Space size={4}>
                                    <Badge
                                        color="#722ed1"
                                    />
                                    <Text type="secondary" className='fw-medium' style={{fontSize: "12px"}}>
                                        {profile.total_payments || 0} Транзак.
                                    </Text>
                                </Space>
                            </Space>
                        );
                    }
                },
                {
                    title: "Реквизит",
                    dataIndex: "identifier",
                    render: (val, profile) => {
                        const service = dictionaries.services.find(
                            (s) => {
                                return Number(s.id) === Number(profile.id_service);
                            }
                        );
                        const serviceName = service?.name || `Сервис #${profile.id_service}`;
                        return (
                            <Space direction="vertical" size={0}>
                                <Text strong copyable>
                                    {val}
                                </Text>
                                <Text type="secondary" style={{fontSize: "11px"}}>
                                    ({profile.id_service}) {serviceName}
                                </Text>
                            </Space>
                        );
                    }
                },
                {
                    title: "Статус",
                    dataIndex: "status",
                    width: "190px",
                    render: (val, profile) => {
                        const statusMap = USERS_TRUST_STATUS;
                        const style = statusMap[val] || statusMap.undefind;

                        return (
                            <div
                                className="d-flex flex-column"
                                style={{gap: '5px'}}
                            >
                                <Tag
                                    icon={style?.icon}
                                    className='fw-bold m-0 text-center text-uppercase'
                                    color={style?.color}
                                >
                                    <span className='ms-2'>{style?.label ?? val}</span>
                                </Tag>

                                <div className="d-flex align-items-center">
                                    <Badge
                                        color='green'
                                        className='me-2'
                                    />
                                    <Text
                                        type="secondary"
                                        className='fw-medium d-flex justify-content-between w-100'
                                        style={{
                                            fontSize: '13px',
                                        }}
                                    >
                                        <span>УР. ДОВЕРИЯ</span> <span> {profile.trust_score} / 100</span>
                                    </Text>
                                </div>
                            </div>
                        );
                    }
                },
                {
                    title: "Последний платёж",
                    dataIndex: "last_payment_at",
                    width: "150px",
                    render: (date) => {
                        return (
                            <Space className="text-secondary">
                                <FontAwesomeIcon icon={faClock} style={{opacity: 0.7}}/>
                                <Text type="secondary">
                                    {date ? dayjs(date).format("DD.MM.YY HH:mm:ss") : "-"}
                                </Text>
                            </Space>
                        );
                    }
                },
                {
                    width: '50px',
                    render: (_, r) => (
                        <ActionButtons
                            {...r}
                            buttonsLinks={{
                                editRoute: {
                                    label: 'Изменить',
                                    action: (id) => {
                                        // 1. Сохраняем данные записи в стейт
                                        setEditingClient(r);
                                        // 2. Заполняем поля формы
                                        form.setFieldsValue({...prepareFormValues(r), id: id});
                                        // 3. Открываем модалку
                                        setIsModalOpen(true);
                                    }
                                },
                            }}
                            dropdownOpen={openDropdownId === r.id}
                            setDropdownOpen={(o) => setOpenDropdownId(o ? r.id : null)}
                        />
                    )
                }
            ];
        },
        [pagination, dictionaries.services, token.colorPrimary, openDropdownId]
    );

    return (
        <ProtectedElement allowedPermissions={"access_management"}>
            <Head>
                <title>Клиенты Антифрод</title>
            </Head>
            <div className="container-fluid py-4">

                <FilterForm onSearch={getHistory} loading={loading} dictionaries={dictionaries}/>

                <Card
                    className="shadow-sm border-0 rounded-4 overflow-hidden"
                    bodyStyle={{padding: 0}}
                    title={
                        <Space>
                            <div style={{width: 4, height: 20, backgroundColor: token.colorPrimary, borderRadius: 2}}/>
                            <Text strong style={{fontSize: "16px"}}>
                                Журнал транзакций
                            </Text>
                        </Space>
                    }
                >
                    <SmartTable
                        loading={loading}
                        data={historyData}
                        size={"small"}
                        columns={columns}
                        onChange={setPagination}
                        expandableContent={(record) => {
                            return (
                                <ProfileDetails
                                    key={`details-${record.id}`}
                                    record={record}
                                    session={session}
                                    apparatsList={dictionaries.apparats}
                                    token={token}
                                />
                            );
                        }}
                        pagination={
                            {
                                position: ['rightTop', 'rightBottom'],
                                defaultPageSize: 100,
                                showSizeChanger: true,
                            }
                        }
                    />
                </Card>
            </div>
            {/* Вынесенная модалка */}
            <EditProfileModal
                open={isModalOpen}
                loading={loading}
                initialData={editingClient}
                onSave={onSave}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingClient(null);
                }}
            />
        </ProtectedElement>
    );
}
