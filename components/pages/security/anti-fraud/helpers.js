import dayjs from "dayjs";
import {SUBJECTS} from "./constants";



/**
 * Утилита форматирования времени (оставил без изменений, так как она универсальна)
 */
export const formatTimeWindow = (minutes) => {
    const mins = Number(minutes);
    if (!mins || mins <= 0) return '';
    if (mins >= 1440) return `${Math.floor(mins / 1440)} дн.`;
    if (mins >= 60) {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return m === 0 ? `${h} ч.` : `${h} ч. ${m} мин.`;
    }
    return `${mins} мин.`;
};

/**
 * Подготовка значений для формы Ant Design (новый формат)
 */
export const prepareFormValues = (record) => {
    if (!record) return { /* дефолты */};

    const params = record.params || {};

    // Функция для поиска объекта по коду поля
    const findSubjectByField = (fieldValue) => {
        for (const [subjKey, subjData] of Object.entries(SUBJECTS)) {
            if (subjData.fields.find(f => f.value === fieldValue)) {
                return subjKey;
            }
        }
        return 'payment'; // дефолт
    };

    const enrichedConditions = (params.conditions || []).map(cond => ({
        ...cond,
        // Если subject уже есть — оставляем, если нет — ищем по полю
        subject: cond.subject || findSubjectByField(cond.field)
    }));

    return {
        id: record.id,
        name: record.name,
        is_active: record.is_active,
        description: record.description,
        service_types_ids: record.service_types_ids || [],
        action_type: params.action_type || 'add',
        risk_value: params.risk_value || 0,
        conditions: enrichedConditions, // Передаем условия с проставленным subject
        working_days: params.working_days || [],
        time_range: params.time_range
            ? [dayjs(params.time_range[0], 'HH:mm'), dayjs(params.time_range[1], 'HH:mm')]
            : null,
    };
};
