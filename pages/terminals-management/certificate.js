import {Button, Typography} from "antd";
import React, {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import Head from "next/head";
import ProtectedElement from "../../components/main/system/ProtectedElement";
import {useAlert} from "../../contexts/AlertContext";
import UniversalSelect from "../../components/main/input/UniversalSelect";
import {
    DOWNLOAD_TERMINAL_PAYMENT_LOGS_API,
    GENERATE_XML_CERTIFICATE_API,
    GET_XML_POINTS_LIST_API
} from "../../routes/api";

const {Title, Text} = Typography;

export default function ApparatReRegistrationPage() {
    const {openNotification} = useAlert();
    const {data: session} = useSession();

    const [loading, setLoading] = useState(false);
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [pointsRaw, setPointsRaw] = useState([])
    const [selectedPoint, setSelectedPoint] = useState();

    const loadPoints = async () => {
        try {
            const response = await fetch(GET_XML_POINTS_LIST_API, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.accessToken}`,
                },
            });
            const result = await response.json();
            if (response.ok) {
                setPointsRaw(result.data || []);
            } else {
                openNotification({type: "error", message: result.resultDescription});
            }
        } catch (error) {
            console.error("Ошибка при загрузке терминалов:", error);
            openNotification({
                type: "error",
                message: "Не удалось загрузить список терминалов",
            });
        }
    };

    const handleSend = async () => {
        setDownloadLoading(true);

        try {
            const response = await fetch(GENERATE_XML_CERTIFICATE_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify([{
                    selectedPoint: selectedPoint,
                    // paymentDate,
                    userId: session?.user?.id,
                }]),
            });

            const result = await response.json();

            if (response.ok) {
                openNotification({type: "success", message: result.resultDescription});
            } else {
                openNotification({type: "error", message: result.resultDescription});
            }

        } catch (error) {
            openNotification({type: 'error', message: error.message || 'Ошибка загрузки'});
        }

        setDownloadLoading(false);
    };

    useEffect(() => {
        if (pointsRaw.length === 0) {
            loadPoints()
        }

    }, []);

    return (
        <ProtectedElement allowedPermissions="develop">
            <Head>
                <title>Сертификаты XML точек | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div className="container d-flex flex-column justify-content-center">
                <div className="d-flex  flex-row justify-content-start mt-3">
                    <div className="card card-body w-50 h-100 d-flex flex-column justify-content-start">
                        <div className="d-flex h-100 flex-column mb-3">
                            <Title level={5}>Сертификаты точек</Title>
                            <UniversalSelect
                                label="XML точка"
                                placeholder="Выберите xml точку"
                                options={pointsRaw.map((item) => ({
                                    value: item.id,
                                    label: `${item.id} ${item.name}`,
                                }))}
                                name="terminal_id"
                                isDisabled={loading}
                                isSearchable
                                onSelectChange={setSelectedPoint}
                            />

                            <Button type="primary" className="mt-2" onClick={handleSend} loading={loading}>
                                Отправить запрос
                            </Button>
                        </div>
                        </div>

                        <div className='w-75 h-100 d-flex flex-column align-content-between justify-content-between'>
                            <div className="d-flex flex-column card card-body align-items-start ms-3">
                        {/*        <Descriptions*/}
                        {/*            layout="horizontal"*/}
                        {/*            size="small"*/}
                        {/*            title='Терминал'*/}
                        {/*            column={2}*/}
                        {/*            items={terminalDesc}*/}
                        {/*        />*/}
                        {/*        <Divider className="border-secondary" dashed={true}>Описание</Divider>*/}
                        {/*        <Text>*/}
                        {/*            На этой странице вы можете найти информацию о платеже, используя логи выбранного*/}
                        {/*            терминала.*/}
                        {/*        </Text>*/}
                        {/*        <Text className='mt-2'>*/}
                        {/*            Для поиска выберите терминал, дату платежа и введите значение — это может быть реквизит*/}
                        {/*            (например, номер счёта или телефона) либо номер транзакции. Также укажите тип поиска:*/}
                        {/*            точный (полное совпадение) или мягкий (поиск по части значения).*/}
                        {/*        </Text>*/}
                        {/*        <Text className='mt-2'>*/}
                        {/*            При необходимости можно включить повторную загрузку логов с терминала — это поможет,*/}
                        {/*            если текущие данные устарели или повреждены.*/}
                        {/*        </Text>*/}
                        {/*        <Text className='mt-2'>*/}
                        {/*            <b>Обратите внимание:</b> первая загрузка логов может занять некоторое время, так как*/}
                        {/*            данные*/}
                        {/*            загружаются с терминала на сервер. Повторные запросы за ту же дату выполняются быстрее,*/}
                        {/*            но логи за текущий день всегда загружаются заново для актуальности.*/}
                        {/*        </Text>*/}
                        {/*        <Text className='mt-2'>*/}
                        {/*            После обработки запроса система покажет, найдены ли подходящие платежи. При успешном*/}
                        {/*            результате вы сможете скачать архив с логами — в нём будет как оригинальный файл*/}
                        {/*            терминала, так и расшифрованные данные по платежам.*/}
                        {/*        </Text>*/}

                        {/*        {(logsResult.status === 'success' || logsResult.status === 'warning') && !loading && (*/}
                        {/*            <>*/}
                        {/*                <Divider className="border-secondary" dashed={true}>Скачать логи</Divider>*/}
                        {/*                <div*/}
                        {/*                    className="d-flex flex-row align-items-center">*/}
                        {/*                    <DownloadOutlined*/}
                        {/*                        className='opacity-25'*/}
                        {/*                        style={{*/}
                        {/*                            fontSize: '70px',*/}
                        {/*                        }}/>*/}
                        {/*                    <div*/}
                        {/*                        className='d-flex align-items-center w-100 h-100 ms-3 border-start'>*/}
                        {/*                        <Text className='ms-3 me-4' type="secondary">*/}
                        {/*                            Вы можете скачать полный архив логов терминала для последующего*/}
                        {/*                            сравнения данных.*/}
                        {/*                            Архив содержит оригинальный файл логов и расшифрованный файл с*/}
                        {/*                            платежами, использованный при выгрузке данных.*/}
                        {/*                        </Text>*/}
                        {/*                        <Button type="primary" loading={downloadLoading}*/}
                        {/*                                onClick={downloadLog}>Скачать</Button>*/}
                        {/*                    </div>*/}
                        {/*                </div>*/}
                        {/*            </>*/}
                        {/*        )}*/}
                        {/*    </div>*/}
                        </div>
                        </div>

                        {/*<ApparatLogsCard logsResult={logsResult} servicesOptionRaw={services}/>*/}
                    </div>
            </div>
        </ProtectedElement>
    );
}
