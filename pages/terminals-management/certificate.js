import {Divider, Typography,} from "antd";
import React, {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import Head from "next/head";
import ProtectedElement from "../../components/main/system/ProtectedElement";
import {useAlert} from "../../contexts/AlertContext";
import {GET_XML_CERTIFICATES_LIST_API,} from "../../routes/api";
import fetchData from "../../components/main/database/DataFetcher";
import {faCheckCircle, faHourglassHalf, faXmarkCircle} from "@fortawesome/free-regular-svg-icons";
import {faBan} from "@fortawesome/free-solid-svg-icons";
import SmartTable from "../../components/main/table/SmartTable";
import ApparatCertificateForm from "../../components/pages/apparat/ApparatCertificateForm";
import searchByColumn from "../../components/main/table/cell/SearchByColumn";
import getLifetime from "../../components/main/system/GetLifeTime";
import StatusIndicator from "../../components/main/table/cell/StatusIndicator";
import ActionButtons from "../../components/main/table/cell/ActionButtons";
import {faMagnifyingGlass} from "@fortawesome/free-solid-svg-icons/faMagnifyingGlass";

const {Title, Text} = Typography;

// --- Константы ---
const CERTIFICATE_STATUSES = [
    {value: null, label: "Отсутствует", icon: faXmarkCircle, color: 'default'},
    {value: "0", label: "Отсутствует", icon: faXmarkCircle, color: 'default'},
    {value: "1", label: "Актуален", icon: faCheckCircle, color: 'success'},
    {value: "2", label: "Актуален", icon: faCheckCircle, color: 'success'},
    {value: "3", label: "Отозван", icon: faBan, color: 'gray'},
    {value: "4", label: "Истекает", icon: faHourglassHalf, color: 'warning'},
    {value: "5", label: "Просрочен", icon: faBan, color: 'danger'},
];

const OLD_CERTIFICATE_LIFE_TIME_DAYS = 750
const NEW_CERTIFICATE_LIFE_TIME_DAYS = 1095

export default function ApparatReRegistrationPage() {
    const {openNotification} = useAlert();
    const {data: session} = useSession();

    const [loading, setLoading] = useState(false);
    const [pointsRaw, setPointsRaw] = useState([]);
    const [dealersRaw, setDealersRaw] = useState([]);
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [openDropdownId, setOpenDropdownId] = useState(null);

    const tableColumns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            ...searchByColumn('id')
        },
        {
            title: "Название точки",
            dataIndex: "name",
            key: "name",
            ...searchByColumn('name')
        },
        {
            title: "Дилер",
            dataIndex: "id_region",
            key: "id_region",
            ...searchByColumn('id_region'),
            render: (text) => {
                const dealer = dealersRaw.find((d) => d.id === text);

                return dealer ? `${text} ${dealer.name}` : text
            }
        },
        {
            title: "Последний запрос",
            dataIndex: "last_query",
            key: "last_query",
        },
        {
            title: "Статус сертификата",
            dataIndex: "ssl_value",
            key: "ssl_value",
            render: (text, record) => {
                const {dayLeft} = getCertificateLifeTime(record.ssl_time);
                let status = text;

                if (text !== null && text !== '0' && text !== '3') {
                    if (dayLeft <= 0) {
                        status = '5'; // Истёк
                    } else if (dayLeft <= 60) {
                        status = '4'; // Скоро истечёт
                    }
                }

                const certStatus = CERTIFICATE_STATUSES.find(c => c.value === status);

                return (
                    <StatusIndicator
                        text={certStatus?.label ?? 'Неизвестно'}
                        color={certStatus?.color}
                        icon={certStatus?.icon}
                    />
                );
            }
        },
        {
            title: "Дата истечения",
            dataIndex: "ssl_time",
            key: "expiresAt",
            render: text => {
                const certLifeEnd =getCertificateLifeTime(text)
                return certLifeEnd.expiresAt ? <Text>{certLifeEnd.expiresAt}</Text> : ''
            }
        },
        {
            title: "Осталось дней",
            dataIndex: "ssl_time",
            key: "day_left",
            render: text => {
                const certLifeEnd = getCertificateLifeTime(text)
                return certLifeEnd.dayLeft !== '' ? <Text>{certLifeEnd.dayLeft} дней</Text> : ''
            }
        },
        {
            key: 'actions',
            render: (_, record) => {
                const actionButtonsLinks = {};
                actionButtonsLinks.moreInfo = {
                    label: 'Открыть сертификат',
                    icon: faMagnifyingGlass,
                    useId: true,
                    action: (id) => {
                        setSelectedPoint(record);
                        window.scrollTo({
                            top: 0,
                            behavior: 'smooth' // Плавная прокрутка
                        });
                    },
                };
                const handleDropdownOpen = (open) => {
                    setOpenDropdownId(open ? record.id : null);
                };

                return (
                    <ActionButtons
                        {...record}
                        buttonsLinks={actionButtonsLinks}
                        dropdownOpen={openDropdownId === record.id}
                        setDropdownOpen={handleDropdownOpen}
                    />
                );
            }
        }
    ]


    //Эта функция нужна чтобы правильно считать время срока жизни старых и новых сертификатов, в будущем нужно удалить
    const getCertificateLifeTime = (createdAt) => {
        let certLifeEnd;

        const created = new Date(createdAt);
        const targetDate = new Date('2025-07-18');

        if (created >= targetDate) {
            certLifeEnd = getLifetime(createdAt, NEW_CERTIFICATE_LIFE_TIME_DAYS);
        } else {
            certLifeEnd = getLifetime(createdAt, OLD_CERTIFICATE_LIFE_TIME_DAYS);
        }

        return certLifeEnd;
    };

    const handleRowClick = (event, record) => {
        const isClickableElement = event.target.closest('[data-clickable="true"]');
        if (!isClickableElement && (!selectedPoint || selectedPoint.id !== record.id)) {
            setSelectedPoint(record);
            window.scrollTo({
                top: 0,
                behavior: 'smooth' // Плавная прокрутка
            });
        }
    };

    useEffect(() => {
        if (!pointsRaw.length) loadPoints();
        if (!dealersRaw.length) loadDealers();

    }, []);

    const loadPoints = async () => {
        setLoading(true)
        try {
            const res = await fetch(GET_XML_CERTIFICATES_LIST_API, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.accessToken}`,
                },
            });
            const result = await res.json();
            if (res.ok) {
                setPointsRaw(result.records || []);
            } else throw new Error(result.resultDescription);
        } catch (err) {
            openNotification({type: "error", message: err.message || "Ошибка загрузки точек"});
        }
        setLoading(false)
    };

    const loadDealers = async () => {
        try {
            const res = await fetchData({model: "Dealer"}, session);
            setDealersRaw(res.data || []);
        } catch (err) {
            openNotification({type: "error", message: `Ошибка дилеров: ${err.message}`});
        }
    };

    return (
        <ProtectedElement allowedPermissions="apparats_service_menu">
            <Head>
                <title>Сертификаты XML точек | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div className="container d-flex flex-column justify-content-center">
                <ApparatCertificateForm
                    pointsRaw={pointsRaw}
                    dealersRaw={dealersRaw}
                    selectedPoint={selectedPoint}
                    setSelectedPoint={setSelectedPoint}
                    certificateStatus={CERTIFICATE_STATUSES}
                    oldCertificateLifeTime={OLD_CERTIFICATE_LIFE_TIME_DAYS}
                    newCertificateLifeTime={NEW_CERTIFICATE_LIFE_TIME_DAYS}
                    updateTable={loadPoints}
                />
                <Divider className="mt-5 mb-3 border-secondary" dashed={true}>
                    <Title level={3}>Список сертификатов</Title>
                </Divider>
                <SmartTable
                    size={"small"}
                    loading={loading}
                    columns={tableColumns}
                    data={pointsRaw}
                    onRow={(record) => ({
                        onClick: (event) => handleRowClick(event, record),
                    })}
                />
            </div>
        </ProtectedElement>
    );
}
