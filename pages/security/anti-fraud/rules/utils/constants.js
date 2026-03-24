import {TERMINAL_TYPES} from "../../../../../components/main/payments/PaymentsConstants";

export const ACTION_MAP = {
    'add': '➕ Начислить баллы',
    'multiply': '✖️ Умножить риск (Коэффициент)',
    'block': '🛑 Остановить платёж',
};

export const DAYS_OF_WEEK = [
    {label: 'Пн', value: 1},
    {label: 'Вт', value: 2},
    {label: 'Ср', value: 3},
    {label: 'Чт', value: 4},
    {label: 'Пт', value: 5},
    {label: 'Сб', value: 6},
    {label: 'Вс', value: 7},
];

const OP_GROUPS = {
    numeric: ['>', '<', '==', '!=', '>=', '<='],
    identity: ['==', '!='],
    velocity: ['count', 'unique', 'sum'],
    list: ['in'],
};

export const SUBJECTS = {
    payment: {
        label: 'Платёж',
        fields: [
            {value: 'identifier', label: 'Реквизит', ops: ['count', '==']},
            {value: 'total', label: 'Сумма вложения', ops: [...OP_GROUPS.numeric, 'sum'],
                compareWith: [
                    {
                        target_subject: 'service',
                        label: 'Cервис',
                        fields: [
                            { value: 'minpay', label: 'Мин. сумма сервиса' },
                            { value: 'maxpay', label: 'Макс. сумма сервиса' }
                        ]
                    }
                ]},
            {value: 'id_region', label: 'Дилер', ops: [...OP_GROUPS.identity, 'unique'], listName: 'dealers'},
            {value: 'id_service', label: 'Сервис', ops: [...OP_GROUPS.identity, 'unique'], listName: 'services'},
            {value: 'id_apparat', label: 'Аппарат', ops: [...OP_GROUPS.identity, 'unique'], listName: 'apparats'},
        ],

    },
    // service: {
    //     label: 'Сервис',
    //     fields: [
    //         {
    //             value: 'minpay', label: 'Мин. сумма (лимит)', ops: OP_GROUPS.numeric, fields: [
    //                 {value: 'total', label: 'Сумма вложения'}
    //             ]
    //         },
    //         {
    //             value: 'maxpay', label: 'Макс. сумма (лимит)', ops: OP_GROUPS.numeric, fields: [
    //                 {value: 'total', label: 'Сумма вложения'}
    //             ]
    //         },
    //     ]
    // },
    apparat: {
        label: 'Аппарат',
        fields: [
            {
                value: 'terminal_type', label: 'Тип аппарата', ops: OP_GROUPS.identity, fields:
                    Object.entries(TERMINAL_TYPES).map(([val, lab]) => ({
                        value: val,
                        label: lab
                    }))
            }
        ]
    },
    dealer: {
        label: 'Дилер',
        fields: [
            {
                value: 'parentid',
                label: 'Родительский дилер',
                ops: [...OP_GROUPS.identity],
                listName: 'dealers'
            },
        ]
    },
    // blacklist: {
    //     label: 'Чёрный список',
    //     fields: [
    //         {value: 'gsfr', label: 'Террористы ГСФР',  ops: ['in']},
    //         {value: 'local', label: 'Локальный список',  ops: ['in']}
    //     ]
    // }
};

export const ALL_OPERATORS = [
    {value: '>', label: 'Больше (>)'},
    {value: '<', label: 'Меньше (<)'},
    {value: '==', label: 'Равно (==)'},
    {value: '!=', label: 'Не равно (!=)'},
    {value: '>=', label: 'Больше или равно (>=)'},
    {value: '<=', label: 'Меньше или равно (<=)'},
    {value: 'count', label: 'Количество', isAggregate: true},
    {value: 'unique', label: 'Кол-во уникальных', isAggregate: true},
    {value: 'sum', label: 'Сумма за период', isAggregate: true},
    {value: 'in', label: 'В списке', isAggregate: true},
];

export const TIME_WINDOWS = [
    {
        value: 5,
        label: '5 мин'
    },
    {
        value: 15,
        label: '15 мин'
    },
    {
        value: 60,
        label: '1 час'
    },
    {
        value: 1440,
        label: '24 часа'
    },
    {
        value: 10080,
        label: '7 дней'
    },
    {
        value: 43200,
        label: '30 дней'
    }
];
