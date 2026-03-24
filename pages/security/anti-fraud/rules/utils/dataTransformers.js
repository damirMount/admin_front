import {ALL_OPERATORS} from "./constants";

export const getCleanedConditions = (conditions = []) => {
    return conditions.map(cond => {
        const opData = ALL_OPERATORS.find(o => o.value === cond.operator);
        const isAggregate = opData?.isAggregate;
        const isRegistry = cond.operator === 'in';

        const base = {
            subject: cond.subject || 'payment',
            field: cond.field,
            operator: cond.operator,
            target_subject: cond.target_subject,
            value_type: cond.value_type,
        };

        // 1. Условия с агрегацией (Количество, Сумма за период и т.д.)
        if (isAggregate) {
            return {
                ...base,
                time_window: cond.time_window || '1h',
                sub_operator: cond.sub_operator || '>',
                value: cond.value,
            };
        }

        // 2. Сравнение с объектами или реестрами
        if (isRegistry) {
            return {
                ...base,
                target_subject: cond.target_subject,
                target_field: cond.target_field,
                value: cond.value, // Важно для оператора 'in'
            };
        }

        // 3. Обычные статические значения
        return {
            ...base,
            value: cond.value,
        };
    });
};
