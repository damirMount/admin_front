import {Badge, Space, Tag, Typography} from "antd";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faAnglesDown,
    faAnglesUp,
    faArrowDownShortWide,
    faClockRotateLeft,
    faFlag,
    faGears,
    faShieldHalved
} from "@fortawesome/free-solid-svg-icons";


import SearchByColumn from "../../../../../components/main/table/cell/SearchByColumn";
import ActionButtons from "../../../../../components/main/table/cell/ActionButtons";
import {prepareFormValues} from "../../../../../components/pages/security/anti-fraud/helpers";

const {Text} = Typography;

const getTableColumns = ({form, setIsModalOpen, setOpenDropdownId, openDropdownId}) => {

    return [
        {
            title: <FontAwesomeIcon icon={faArrowDownShortWide}/>,
            dataIndex: 'id',
            width: '40px',
            className: 'text-center',
            render: (id, record) => (
                <Text type="secondary" style={{fontSize: '12px'}}>#{record.priority}</Text>
            )
        },
        {
            title: 'Название',
            dataIndex: 'name',
            width: '40%',
            render: (t, r) => (
                <div className="af-algorithm-cell">
                    <div className="mb-1 d-flex flex-column">
                        <Text strong style={{color: '#434343'}}>{t}</Text>
                        {r.service_types_ids?.length === 0 && (
                            <Text type="secondary" style={{fontSize: '10px'}}>
                                <FontAwesomeIcon icon={faShieldHalved} className="me-1"/>
                                Глобальная защита
                            </Text>
                        )}
                    </div>
                </div>
            ),
            ...SearchByColumn('name')
        },
        {
            title: 'Условие срабатывания',
            width: '200px',
            render: (_, r) => {
                const params = r.params || {};
                const conditions = params.conditions || [];
                const timeRange = params.time_range || [];
                const hasTime = timeRange?.length === 2 && timeRange[0];

                if (conditions.length === 0 && !hasTime) {
                    return (
                        <Space>
                            <FontAwesomeIcon icon={faGears} className="text-secondary" style={{fontSize: '12px'}}/>
                            <Text strong style={{color: '#434343'}}>Для всех транзакций</Text>
                        </Space>
                    );
                }

                return (
                    <div className="d-flex flex-column gap-1 py-1">
                        {/* Вывод количества условий вместо списка */}
                        {conditions.length > 0 && (
                            <div className="d-flex align-items-center gap-2">
                                <Text strong style={{color: '#434343'}}>
                                    {conditions.length === 1 && conditions[0].operator === 'in'
                                        ? <Space>
                                            <FontAwesomeIcon icon={faFlag} className="text-danger"
                                                             style={{fontSize: '12px'}}/>
                                            <Text strong style={{color: '#434343'}}>В чёрном списке</Text>
                                        </Space>
                                        : `Кол-во условий: ${conditions.length}`
                                    }
                                </Text>
                            </div>
                        )}

                        {/* Время работы (дизайн сохранен) */}
                        {hasTime && (
                            <div className="d-flex align-items-center gap-2">
                                <FontAwesomeIcon
                                    icon={faClockRotateLeft}
                                    className="text-primary"
                                    style={{fontSize: '13px'}}
                                />
                                <Text strong style={{fontSize: '13px', color: '#434343'}}>
                                    Работает с {timeRange[0]} до {timeRange[1]}
                                </Text>
                            </div>
                        )}
                    </div>
                );
            }
        },
        {
            title: 'Реакция',
            align: 'center',
            width: '50px',
            render: (_, r) => {
                const type = r.params?.action_type;
                const score = r.params?.risk_value;

                if (type === 'block') {
                    return (
                        <Tag color="red-inverse"
                             className={`w-100 text-center fw-bold ${!r.is_active ? 'opacity-25' : ''}`}>
                            Стоп
                        </Tag>
                    );
                }

                const isMultiply = type === 'multiply';
                const tagText = isMultiply ? `×${score}` : `+${score} AF`;
                const tagColor = isMultiply ? score > 1.0 ? 'purple-inverse' : 'green-inverse' : 'blue';

                const icon = isMultiply && score > 1.0 ? faAnglesUp : faAnglesDown
                return (
                    <Tag color={tagColor} className={`w-100 text-center fw-bold ${!r.is_active ? 'opacity-25' : ''}`}>
                        {isMultiply && <FontAwesomeIcon icon={icon} className="me-1"/>}
                        {tagText}
                    </Tag>
                );
            }
        },
        {
            title: 'Статус',
            dataIndex: 'is_active',
            width: '80px',
            render: (a) => (
                <div className="d-flex align-items-center text-nowrap" style={{gap: '8px'}}>
                    <Badge status={a ? "success" : "default"}/>
                    <Text style={{color: a ? '#52c41a' : '#bfbfbf', fontSize: '13px'}}>
                        {a ? 'Активно' : 'Пауза'}
                    </Text>
                </div>
            )
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
                                form.setFieldsValue({...prepareFormValues(r), id: id});
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
};
export default getTableColumns;
