import React, { useMemo, useState } from "react";
import { Button, Card, Empty, Image, List, Modal, Typography } from "antd";
import { MoneyFormatNumber } from "../../../../components/main/system/MoneyFormatNumber"; // Корректируйте путь при необходимости

const { Text } = Typography;

export default function PaymentsStatisticsTops({ statistics, dictionaries }) {
    const [modalConfig, setModalConfig] = useState({ visible: false, title: '', data: [], showImage: false });

    // Расчет топ-листов
    const tops = useMemo(() => {
        const getTopByDimension = (dimensionKey, dictArray, dictNameField = 'name') => {
            const summaryMap = {};
            statistics.forEach(item => {
                const id = item[dimensionKey];
                if (id === null || id === undefined) return;

                if (!summaryMap[id]) {
                    summaryMap[id] = { id, total: 0, count: 0 };
                }
                summaryMap[id].total += Number(item.total || 0);
                summaryMap[id].count += Number(item.count || 0);
            });

            const result = Object.values(summaryMap).map(entry => {
                const foundItem = dictArray?.find(d => String(d.id) === String(entry.id));
                const entityName = foundItem?.[dictNameField];
                const entityLogo = foundItem?.src_small || foundItem?.src;

                return {
                    ...entry,
                    name: entityName || `ID: ${entry.id}`,
                    logo: entityLogo || null,
                };
            });

            return result.sort((a, b) => b.total - a.total);
        };

        return {
            dealers: getTopByDimension('dealer_id', dictionaries?.dealers),
            services: getTopByDimension('service_id', dictionaries?.services),
            apparats: getTopByDimension('apparat_id', dictionaries?.apparats)
        };
    }, [statistics, dictionaries]);

    // Локальный компонент карточки
    const RenderTopCard = ({ title, data, emptyMessage, showImage = false }) => (
        <Card title={<span className="fw-bold text-dark fs-6">{title}</span>} size="small"
              className="shadow-sm flex-fill mx-2 mb-3 border"
              style={{ borderRadius: '12px', minWidth: '290px', backgroundColor: '#fff' }}
              extra={data.length > 5 && (
                  <Button type="link" size="small" onClick={() => setModalConfig({ visible: true, title, data, showImage })}>
                      Весь список
                  </Button>
              )}>
            {data.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className="text-muted" style={{ fontSize: '12px' }}>{emptyMessage}</span>} />
            ) : (
                <List
                    size="small"
                    dataSource={data.slice(0, 5)}
                    renderItem={(item, index) => (
                        <List.Item className="d-flex justify-content-between align-items-center px-1 py-2 border-0 rounded-2 item-hover-effect">
                            <div className="d-flex align-items-center text-truncate me-2" style={{ maxWidth: '75%', minWidth: 0 }}>
                                <span
                                    className="badge rounded-circle me-2 d-flex align-items-center justify-content-center fw-bold"
                                    style={{
                                        width: '22px', height: '22px', fontSize: '11px',
                                        backgroundColor: index < 3 ? '#f1f5f9' : 'transparent',
                                        color: index < 3 ? '#475569' : '#94a3b8'
                                    }}>
                                    {index + 1}
                                </span>

                                {showImage && (
                                    <Image
                                        src={`https://kg.quickpay.kg/kassir/${item.logo || ''}`}
                                        style={{ width: '24px', height: '24px', objectFit: 'contain', borderRadius: '6px', backgroundColor: '#f8fafc' }}
                                        className="flex-shrink-0 border p-0.5" alt=""
                                    />
                                )}

                                <Text className="ms-2 text-dark text-truncate fw-medium" title={item.name} style={{ fontSize: '13px' }}>{item.name}</Text>
                            </div>
                            <Text className="fw-bold text-end flex-shrink-0" style={{ color: '#522c58', fontSize: '13px' }}>{MoneyFormatNumber(item.total, 'short')}</Text>
                        </List.Item>
                    )}
                />
            )}
        </Card>
    );

    return (
        <div className="col-12 px-0 mb-3">
            <div className="d-flex flex-wrap justify-content-between">
                <RenderTopCard title="🏆 Топ Дилеров" data={tops.dealers} emptyMessage="Выберите группировку 'Подробно' для дилеров в фильтрах." />
                <RenderTopCard title="⭐ Топ Сервисов" data={tops.services} emptyMessage="Выберите группировку 'Подробно' для сервисов в фильтрах." showImage={true} />
                <RenderTopCard title="🖥️ Топ Аппаратов" data={tops.apparats} emptyMessage="Выберите группировку 'Подробно' для аппаратов в фильтрах." />
            </div>

            {/* Модальное окно просмотра всего списка (теперь инкапсулировано здесь) */}
            <Modal
                title={
                    <div className="d-flex align-items-center gap-2 pb-2 border-bottom">
                        <span className="fs-5 fw-bold text-dark">{modalConfig.title}</span>
                        <span className="badge bg-light text-secondary border rounded-pill">{modalConfig.data?.length || 0}</span>
                    </div>
                }
                open={modalConfig.visible}
                onCancel={() => setModalConfig({ ...modalConfig, visible: false })}
                footer={<Button type="primary" onClick={() => setModalConfig({ ...modalConfig, visible: false })}>Закрыть</Button>}
                width={550}
                centered
            >
                <div style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: '10px' }}>
                    <List
                        size="middle"
                        dataSource={modalConfig.data}
                        renderItem={(item, index) => (
                            <List.Item className="d-flex justify-content-between align-items-center py-3 border-bottom border-light">
                                <div className="d-flex align-items-center" style={{ maxWidth: '75%' }}>
                                    <span
                                        className="badge rounded-circle me-3 d-flex align-items-center justify-content-center fw-bold shadow-sm flex-shrink-0"
                                        style={{
                                            width: '28px', height: '28px', fontSize: '12px',
                                            backgroundColor: index === 0 ? '#fef08a' : index === 1 ? '#e2e8f0' : index === 2 ? '#fed7aa' : '#f8fafc',
                                            color: index < 3 ? '#475569' : '#94a3b8',
                                            border: index < 3 ? '1px solid rgba(0,0,0,0.05)' : '1px solid #e2e8f0'
                                        }}>
                                        {index + 1}
                                    </span>

                                    {modalConfig.showImage && (
                                        <Image
                                            src={`https://kg.quickpay.kg/kassir/${item.logo || ''}`}
                                            style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#f8fafc' }}
                                            className="flex-shrink-0 border p-1 shadow-sm" alt=""
                                        />
                                    )}

                                    <Text className="ms-3 fw-medium text-dark text-truncate" title={item.name} style={{ fontSize: '14px' }}>
                                        {item.name}
                                    </Text>
                                </div>
                                <div className="text-end ms-3 flex-shrink-0">
                                    <span className="fw-bold d-block" style={{ color: '#522c58', fontSize: '15px' }}>{MoneyFormatNumber(item.total, 'full')}</span>
                                    {item.count > 0 && <span className="text-muted" style={{ fontSize: '11px' }}>{item.count.toLocaleString('ru-RU')} транз.</span>}
                                </div>
                            </List.Item>
                        )}
                    />
                </div>
            </Modal>
        </div>
    );
}