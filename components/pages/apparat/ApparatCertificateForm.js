import {Button, Descriptions, Divider, Empty, Result, Select, Tooltip, Typography,} from "antd";
import React, {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import ProtectedElement from "../../../components/main/system/ProtectedElement";
import {useAlert} from "../../../contexts/AlertContext";
import {
    DOWNLOAD_XML_CERTIFICATE_API,
    GENERATE_XML_CERTIFICATE_API,
    GET_XML_CERTIFICATE_INFO_API,
} from "../../../routes/api";
import {CloseCircleOutlined, DownloadOutlined, SyncOutlined} from "@ant-design/icons";
import {faSpinner} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import ModalWindow from "../../../components/main/system/ModalWindow";
import getLifetime from "../../main/system/GetLifeTime";

const {Title, Text, Paragraph} = Typography;
const Option = Select.Option;
// --- Константы ---
const CERTIFICATE_TYPES = [
    {value: null, label: "Отсутствует"},
    {value: "0", label: "Отсутствует"},
    {value: "1", label: "PKCS#12 (.p12)"},
    {value: "2", label: "CSR"},
    {value: "3", label: "Отозван"},
    {value: "5", label: "Истёк"},
];

export default function ApparatCertificateForm({
                                                   pointsRaw,
                                                   dealersRaw,
                                                   selectedPoint = [],
                                                   setSelectedPoint,
                                                   certificateStatus,
                                                   oldCertificateLifeTime,
                                                   newCertificateLifeTime,
                                                   updateTable
                                               }) {
    const {openNotification} = useAlert();
    const {data: session} = useSession();

    const [loading, setLoading] = useState(false);
    const [downloadLoading, setDownloadLoading] = useState(false);

    const [showModal, setShowModal] = useState(false)
    const modalData = {
        title: 'Внимание, вы действительно уверены, что хотите обновить сертификат для данной XML-точки? ',
        message: `Текущий сертификат ещё действителен и продолжит работать, однако после обновления вы больше не сможете его скачать. </br></br>
            Пожалуйста, передайте новый сертификат поставщику услуг и убедитесь, что он успешно внедрён на его стороне.`,
        button: 'Выгрузить',
        buttonVariant: `purple`,
    };

    const [certResult, setCertResult] = useState({
        status: 'info',
        desc: '',
    });

    const [certificateDesc, setCertificateDesc] = useState([
        {label: "Тип сертификата", children: ""},
        {label: "Дата создания", children: ""},
        {label: "Пароль", children: ""},
        {label: "Дата истечения", children: ""},
    ]);

    const [mainPointDesc, setMainPointDesc] = useState([
        {label: "Название", children: "(Пусто)"},
        {label: "Дилер", children: "(Пусто)"},
    ]);

    const [pointDesc, setPointDesc] = useState([
        {label: "Тип точки", children: "XML точка"},
        {label: "Статус сертификата", children: "(Неизвестно)"},
        {label: "Дата регистрации", children: "(Пусто)"},
        {label: "Последний запрос", children: "(Пусто)"},
    ]);

    //Эта функция нужна чтобы правильно считать время срока жизни старых и новых сертификатов, в будущем нужно удалить
    const getCertificateLifeTime = (createdAt) => {
        let certLifeEnd;

        const created = new Date(createdAt);
        const targetDate = new Date('2025-07-18');

        if (created >= targetDate) {
            certLifeEnd = getLifetime(createdAt, newCertificateLifeTime);
        } else {
            certLifeEnd = getLifetime(createdAt, oldCertificateLifeTime);
        }

        return certLifeEnd;
    };

    const handleSelectPoint = async (updateScreen = true) => {
        const dealer = dealersRaw.find((d) => d.id === selectedPoint.id_region);
        setMainPointDesc([
            {label: "Название", children: `${selectedPoint.id} ${selectedPoint.name}`},
            {label: "Дилер", children: dealer ? `${dealer.id} ${dealer.name}` : "N/A"},
        ]);
        setPointDesc([
            {label: "Тип точки", children: "XML точка"},
            {
                label: "Статус сертификата", children:
                    <div className='d-flex align-items-center text-nowrap me-5'>
                        <FontAwesomeIcon size={'lg'} className='me-2' icon={faSpinner}/>
                        <Text>Загрузка...</Text>
                    </div>
            },
            {label: "Дата регистрации", children: selectedPoint.register_date},
            {label: "Последний запрос", children: selectedPoint.last_query},
        ]);

        await loadCertificateInfo(selectedPoint.id, updateScreen);
    };

    const loadCertificateInfo = async (pointId, updateScreen) => {
        try {
            const res = await fetch(GET_XML_CERTIFICATE_INFO_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify([{selectedPoint: pointId}]),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.resultDescription);

            const cert = result.certificate;
            const certLife = getCertificateLifeTime(cert.createdAt);

            let status = cert.status;
            if (status && !['0', '3'].includes(status)) {
                if (certLife.dayLeft <= 0) status = '5';
                else if (certLife.dayLeft <= 60) status = '4';
            }

            const certType = CERTIFICATE_TYPES.find(c => c.value === cert.status) ?? { label: "—" };
            const certStatus = certificateStatus.find(c => c.value === status) ?? { label: "—", icon: null };


            setCertificateDesc([
                {label: "Тип сертификата", children: certType?.label || "—"},
                {label: "Дата создания", children: cert.createdAt},
                {label: "Пароль", children: cert.password},
                {
                    label: "Дата истечения",
                    children: (
                        <Text className={certLife.dayLeft <= 60 ? 'fw-bold text-danger' : ''}>
                            {certLife.expiresAt}
                        </Text>
                    ),
                },
            ]);

            setPointDesc(prev =>
                prev.map(item =>
                    item.label === "Статус сертификата"
                        ? {
                            ...item,
                            children: (
                                <div className="d-flex align-items-center text-nowrap me-5">
                                    <FontAwesomeIcon size="lg" className="me-2" icon={certStatus?.icon}/>
                                    <Text>{certStatus?.label || "-"}</Text>
                                </div>
                            ),
                        }
                        : item
                )
            );

            if (updateScreen) {
                if (certStatus.label === 'Отсутствует') {
                    setCertResult({
                        status: 'create',
                        desc: '',
                    })
                } else {
                    setCertResult({
                        status: 'info',
                        desc: '',
                    })
                }
            }

        } catch (err) {
            openNotification({
                type: "error",
                message: err.message || "Ошибка получения информации о сертификате",
            });
        }
    };


    const handleGenerate = async () => {
        if (!selectedPoint) return;
        setLoading(true);

        try {
            const res = await fetch(GENERATE_XML_CERTIFICATE_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify([{selectedPoint: selectedPoint.id}]),
            });
            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.resultDescription);
            }

            await handleSelectPoint(false)

            setCertResult({
                status: 'success',
                desc: result.resultDescription,
            })
            updateTable(true)

        } catch (err) {
            setCertResult({
                status: 'error',
                desc: err,
            })
        }
        setLoading(false);
    };

    const handleDownload = async () => {
        if (!selectedPoint) return;
        setDownloadLoading(true);

        try {
            const res = await fetch(DOWNLOAD_XML_CERTIFICATE_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify([{selectedPoint: selectedPoint.id, userId: session?.user?.id}]),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.resultDescription);
            }

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${selectedPoint.id}.p12`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            openNotification({type: "error", message: err.message});
        }

        setDownloadLoading(false);
    };

    useEffect(() => {
        if (selectedPoint) {
            handleSelectPoint()
        }
    }, [selectedPoint]);

    return (
        <ProtectedElement allowedPermissions="develop">
            <ModalWindow
                showModal={showModal} // Передаем состояние модального окна
                data={modalData}
                closeModal={() => setShowModal(false)} // Передаем функцию для закрытия модального окна
                onHandle={handleGenerate} // Передаем функцию для вызова при нажатии на кнопку в модальном окне
            />
            {selectedPoint && (
                <div className="d-flex flex-row justify-content-start mt-3">
                    {/* Список точек */}
                    <div className="card card-body w-50 d-flex flex-column">
                        <Title level={5}>Данные о точке</Title>
                        <Text type={"secondary"} className='mb-1 mt-2'>XML точка</Text>
                        <Select
                            placeholder="Выберите XML точку"
                            size="large"
                            value={selectedPoint?.id}
                            disabled={loading}
                            showSearch
                            optionLabelProp="label"
                            onChange={(selectedId) => {
                                const newPoint = pointsRaw.find(p => p.id === selectedId);
                                if (newPoint && newPoint.id !== selectedPoint?.id) {
                                    setSelectedPoint(newPoint);
                                }
                            }}
                        >
                            {pointsRaw.map((p) => (
                                <Option key={p.id} value={p.id} label={`${p.id} ${p.name}`}>
                                    {`${p.id} ${p.name}`}
                                </Option>
                            ))}
                        </Select>
                        <>
                            <Divider dashed className="border-secondary">Описание точки</Divider>
                            <Descriptions layout="vertical" size="small" column={1} items={mainPointDesc}/>
                            <Descriptions layout="vertical" size="small" column={2} items={pointDesc}/>
                        </>
                    </div>

                    {/* Сертификат и действия */}
                    <div className="w-75 d-flex flex-column ms-3">
                        <div className="d-flex card card-body justify-content-center">

                            {loading ? (
                                <Result
                                    icon={<SyncOutlined className="color-purple" spin/>}
                                    title={`Выполнение запроса...`}
                                    subTitle="Пожалуйста подождите, это может занять несколько минут..."
                                />
                            ) : (
                                <>
                                    {certResult.status === 'info' && (
                                        <>
                                            <Descriptions
                                                layout="horizontal"
                                                size="small"
                                                title={`Сертификат точки: ${selectedPoint.id} ${selectedPoint.name}`}
                                                column={2}
                                                items={certificateDesc}
                                            />
                                            <Divider dashed className="border-secondary">Скачать сертификат</Divider>
                                            <div className="d-flex align-items-center">
                                                <DownloadOutlined style={{fontSize: "70px", opacity: 0.25}}/>
                                                <div className="d-flex ms-3 border-start ps-3 align-items-center">
                                                    <Text type="secondary">
                                                        Скачайте сертификат и передайте его поставщику услуг вместе с
                                                        паролем.
                                                        Этот
                                                        сертификат должен использоваться при отправке запросов в нашу
                                                        систему в
                                                        соответствии с API-протоколом, чтобы обеспечить безопасность
                                                        взаимодействия.
                                                    </Text>
                                                    <Button
                                                        type="primary"
                                                        className="ms-3"
                                                        loading={loading || downloadLoading}
                                                        onClick={handleDownload}
                                                    >
                                                        Скачать
                                                    </Button>
                                                </div>
                                            </div>

                                            <Divider dashed className="border-secondary">Действия</Divider>
                                            <div className="d-flex flex-column">
                                                <div className="d-flex align-items-end">
                                                    <Text><b>• Обновление:</b> Сертификат будет заменён и старый станет
                                                        недействительным.</Text>
                                                    <Button type="primary" className="ms-3" loading={loading}
                                                            onClick={() => setShowModal(true)}>
                                                        Обновить сертификат
                                                    </Button>
                                                </div>

                                                <div className="d-flex align-items-end mt-2">
                                                    <Text><b>• Отзыв:</b> Сертификат будет заблокирован и более не будет
                                                        использоваться.</Text>
                                                    <Tooltip title="Функция временно недоступна">
                                                        <Button className="ms-3" disabled>
                                                            Заблокировать сертификат
                                                        </Button>
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {certResult.status === 'create' && (
                                        <>
                                            <Result
                                                icon={<Empty description={false}/>}
                                                title="Сертификат отсутвует"
                                                subTitle="Для данной точки отсутвует сертификат.
                                                Этот сертификат должен использоваться при отправке запросов в нашу
                                                систему в соответствии с API-протоколом, чтобы обеспечить безопасность
                                                взаимодействия."
                                                extra={[
                                                    <Button
                                                        type="primary"
                                                        onClick={() => setShowModal(true)}
                                                        key="console">
                                                        Создать сертификат
                                                    </Button>,
                                                ]}
                                            />
                                        </>
                                    )}
                                    {certResult.status === 'success' && (
                                        <>
                                            <Result
                                                status="success"
                                                title="Сертификат успешно создан"
                                                subTitle={
                                                    <>
                                                        <Text type='secondary'> Скачайте данный сертификат и передайте
                                                            его поставщику услуг
                                                            вместе с
                                                            паролем, для возможности взаимодействия с нашим
                                                            API-протоколом
                                                        </Text>
                                                        <Title level={5} className='fw-bold'>{certResult.desc}</Title>
                                                    </>
                                                }
                                                extra={[
                                                    <Button type="primary" onClick={handleDownload} key="console">
                                                        Скачать
                                                    </Button>,
                                                    <Button
                                                        key="back"
                                                        onClick={() =>
                                                            setCertResult((prev) => ({
                                                                ...prev,
                                                                status: 'info',
                                                            }))
                                                        }
                                                    >
                                                        Назад
                                                    </Button>


                                                ]}
                                            />
                                        </>
                                    )}
                                    {certResult.status === 'error' && (
                                        <Result
                                            status="error"
                                            title="Не удалось выполнить запрос"
                                            subTitle="Произошла непредвиденная ошибка при выполнении запроса."
                                        >
                                            <Paragraph>
                                                <Text strong>Причина:</Text>
                                            </Paragraph>
                                            <Paragraph>
                                                <CloseCircleOutlined className="site-result-demo-error-icon" /> {String(certResult.desc)}
                                            </Paragraph>
                                        </Result>
                                    )}

                                </>
                            )}
                        < /div>

                    </div>
                </div>
            )}
        </ProtectedElement>
    );
}
