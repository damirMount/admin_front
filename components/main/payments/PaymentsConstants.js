export const TERMINAL_TYPES = {
    1: 'Терминал',
    2: 'Кассир',
    3: 'Java/POS-Кассир',
    100: 'Суб.точка',
    101: 'API точка',
    5: 'SMS точка',
};

export const RUN_STATUS = {
    PROCESSING_3: -3,
    PROCESSING_2: -2,
    PROCESSING_1: -1,
    CREATED: 0,
    SUCCESS: 1,
    ERROR: 2,
    WAIT_CONFIRMATION: 3
};

export const ADDITIONAL_CMD = {
    WAITING: -1,
    CANCELED: -544,
    REPAYED: -545
};

export const RISK_LEVELS = [
    {
        value: "high",
        color: "red",
        label: "Критический"
    },
    {
        value: "medium",
        color: "orange",
        label: "Средний"
    },
    {
        value: "low",
        color: "green",
        label: "Низкий"
    }
];

/**
 * Возвращает объект с описанием статуса, цветом и иконкой
 * @param {number} status - Значение из RUN_STATUS
 * @param {number|string} additional - Значение из ADDITIONAL_CMD или код ошибки
 */
export const getPaymentStatusInfo = (status, additional) => {
    const addCmd = Number(additional);
    status = Number(status);

    if (status === RUN_STATUS.ERROR) {
        // 1. Сначала проверяем специфические команды (ошибки/состояния)
        if (addCmd === ADDITIONAL_CMD.CANCELED) {
            return {
                text: 'Отменён',
                color: '#ff4d4f',
                icon: 'faCircleXmark',
                type: 'error'
            };
        }

        if (addCmd === ADDITIONAL_CMD.REPAYED) {
            return {
                text: 'Перепроведен',
                color: '#722ed1',
                icon: 'faRotateLeft',
                type: 'warning'
            };
        }
    }

    if (addCmd === ADDITIONAL_CMD.WAITING) {
        return {
            text: 'В ожидании',
            color: '#faad14',
            icon: 'faRotateLeft',
            type: 'warning'
        };
    }


    // 2. Если команд нет, идем по основным статусам RUN_STATUS
    switch (status) {
        case RUN_STATUS.SUCCESS:
            return {
                text: 'Успешно',
                color: '#52c41a',
                icon: 'faCircleCheck',
                type: 'success'
            };

        case RUN_STATUS.ERROR:
            return {
                text: `Ошибка ${additional}`,
                color: '#f5222d',
                icon: 'faTriangleExclamation',
                type: 'error'
            };

        case RUN_STATUS.WAIT_CONFIRMATION:
            return {
                text: 'Ожидает разрешения',
                color: '#faad14',
                icon: 'faClock',
                type: 'wait_confirmation'
            };

        case RUN_STATUS.CREATED:
            return {
                text: "В очереди",
                color: '#8c8c8c',
                icon: 'faCircleDot',
                type: 'info'
            };

        case RUN_STATUS.PROCESSING_1:
        case RUN_STATUS.PROCESSING_2:
        case RUN_STATUS.PROCESSING_3:
            return {
                text: 'В обработке',
                color: '#1890ff',
                icon: 'faSpinner',
                type: 'process'
            };

        default:
            return {
                text: `Неизвестно (${status})`,
                color: '#d9d9d9',
                icon: 'faQuestion',
                type: 'unknown'
            };
    }
};

export class PAYMENT_ERRORS {
    // Коды ошибок
    static OK = 0;
    static FAR_LOW_BALANCE_NONFINAL = -10003;
    static FAR_LOW_BALANCE = -10001;
    static LOW_BALANCE = -10000;
    static APPARAT_NOT_REGISTERED = -101;
    static NO_CONNECTION = -100;
    static PARSE_ERROR = -99;
    static UNKNOWN_REQUEST = -98;
    static BAD_REQUEST = -97;
    static BAD_ANSWER = -96;
    static BAD_ANSWER_HARD = -95;
    static ACCOUNT_NOT_FOUND = -23;
    static ACCOUNT_NOT_REGISTERED = -22;
    static BAD_ID = -7;
    static APPARAT_LIMIT = -10002;
    static PHONE_LIMIT = -10103;
    static IDENTIFIER_BAN = -10104;
    static BAD_AMOUNT = -8;
    static BAD_POINT = -9;
    static NO_PARAMETER = -10;
    static DO_NOT_ACCEPT = -11;
    static REQUEST_NOT_FOUND = -60;
    static BAD_DATE = -61;
    static SERVICE_BLOCKED = -45;
    static PRODUCT_UNAVAIBLE = -451;
    static PRODUCT_UNAVAIBLE_FROM_CUSTOMER = -452;
    static PRODUCT_EXCEED_LIMIT_FROM_CUSTOMER = -453;
    static TECHNICAL_PROBLEM = -24;
    static VALIDATION_ERROR = -25;
    static VALIDATION_ERROR_WRONG_TUPLE = -25010;
    static VALIDATION_ERROR_WRONG_OBJECT = -25020;
    static VALIDATION_ERROR_WRONG_SUB_LENGTH = -25030;
    static VALIDATION_ERROR_WRONG_COM_SETTINGS = -25040;
    static VALIDATION_ERROR_WRONG_COM_SETTINGS_API = -25041;
    static VALIDATION_ERROR_WRONG_CALCULATE = -25050;
    static VALIDATION_ERROR_WRONG_SUMS = -25060;
    static VALIDATION_ERROR_UPPER_LIMIT = -25070;
    static VALIDATION_ERROR_LOWER_LIMIT = -25071;
    static VALIDATION_ERROR_DAILY_INNER_LIMIT = -25072;
    static VALIDATION_ERROR_MONTHY_INNER_LIMIT = -25073;
    static VALIDATION_ERROR_DAILY_OUTER_LIMIT = -25074;
    static VALIDATION_ERROR_MONTHLY_OUTER_LIMIT = -25075;
    static INTERNAL_ERROR = -64;
    static REPEAT_PAYMENT = -2001;
    static DOUBLE_PAYMENT = -2002;
    static NOT_CONFIRMED_PAYMENT = -2003;
    static RETURN_MONEY = -543;
    static CANCEL_PAYMENT = -544;
    static CANCELING_PAYMENT = -545;
    static CANCELED = -600;
    static CANCELLATION_NOT_POSSIBLE = -601;
    static CANCELLATION_NOT_SUPPORTED = -602;
    static CANCELLATION_PERIOD_EXPIRED = -603;
    static FISHY_PAYMENT = -666;
    static SERVICE_UNAVAILABLE = -1112;
    static PAYER_ACCOUNT_NOT_FOUND = -1113;
    static PAYER_BLOCKED = -1114;
    static PAYER_ACCOUNT_BLOCKED = -1115;
    static PAYER_ACTIVE_ACCOUNT_NOT_FOUND = -1116;
    static RECIPIENT_NOT_FOUND = -1117;
    static RECIPIENT_BLOCKED = -1118;
    static RECIPIENT_ACCOUNT_NOT_FOUND = -1119;
    static RECIPIENT_ACCOUNT_BLOCKED = -1121;
    static RECIPIENT_ACTIVE_ACCOUNT_NOT_FOUND = -1122;
    static CONVERSATION_RATE_CHANGED = -1123;
    static ALLOWED_BALANCE_EXCEEDED = -1124;
    static WAIT = 1;
    static PASS_WAIT = 2;
    static UNKNOWN = -9999;

    // Словарь описаний (ключ - сам код из статических свойств)
    static descriptions = {
        [this.OK]: 'OK',
        [this.FAR_LOW_BALANCE]: 'недостаточно средств QuickPay, финальная',
        [this.FAR_LOW_BALANCE_NONFINAL]: 'недостаточно средств QuickPay, не финальная',
        [this.LOW_BALANCE]: 'недостаточно средств',
        [this.SERVICE_UNAVAILABLE]: 'Сервис временно недоступен',
        [this.PAYER_ACCOUNT_NOT_FOUND]: 'Плательщик не найден в системе',
        [this.PAYER_BLOCKED]: 'Плательщик заблокирован',
        [this.PAYER_ACCOUNT_BLOCKED]: 'Счет плательщика заблокирован',
        [this.PAYER_ACTIVE_ACCOUNT_NOT_FOUND]: 'Активный счет плательщика не найден в системе',
        [this.RECIPIENT_NOT_FOUND]: 'Получатель не найден в системе',
        [this.RECIPIENT_BLOCKED]: 'Получатель заблокирован',
        [this.RECIPIENT_ACCOUNT_NOT_FOUND]: 'Счет получателя не найден в системе',
        [this.RECIPIENT_ACCOUNT_BLOCKED]: 'Счет получателя заблокирован',
        [this.RECIPIENT_ACTIVE_ACCOUNT_NOT_FOUND]: 'Активный счет получателя не найден в системе',
        [this.CONVERSATION_RATE_CHANGED]: 'Курс конверсии изменен',
        [this.ALLOWED_BALANCE_EXCEEDED]: 'Превышен допустимый баланс',
        [this.APPARAT_NOT_REGISTERED]: 'аппарат не зарегистрирован',
        [this.NO_CONNECTION]: 'нет соединения',
        [this.PARSE_ERROR]: 'ошибка парсинга',
        [this.UNKNOWN_REQUEST]: 'неизвестный запрос',
        [this.BAD_REQUEST]: 'неверный формат запроса',
        [this.BAD_ANSWER]: 'неверный ответ',
        [this.BAD_ANSWER_HARD]: 'неверный ответ',
        [this.ACCOUNT_NOT_FOUND]: 'идентификатор неверен',
        [this.ACCOUNT_NOT_REGISTERED]: 'плательщик не зарегистрирован',
        [this.BAD_ID]: 'такой id уже существует',
        [this.BAD_AMOUNT]: 'неверная сумма',
        [this.BAD_POINT]: 'неверная точка',
        [this.APPARAT_LIMIT]: 'превышена максимальная сумма проведения данного аппарата',
        [this.PHONE_LIMIT]: 'превышен лимит суммы по номеру телефона',
        [this.IDENTIFIER_BAN]: 'идентификатор в чёрном списке',
        [this.NO_PARAMETER]: 'нет обязательного параметра',
        [this.DO_NOT_ACCEPT]: 'платеж не принят',
        [this.REQUEST_NOT_FOUND]: 'запроса не было',
        [this.BAD_DATE]: 'дата неверна',
        [this.SERVICE_BLOCKED]: 'сервис временно заблокирован',
        [this.PRODUCT_UNAVAIBLE]: 'Cервис или номинал не доступен у данного поставщика',
        [this.PRODUCT_UNAVAIBLE_FROM_CUSTOMER]: 'Продукт не доступен для плательщика',
        [this.PRODUCT_EXCEED_LIMIT_FROM_CUSTOMER]: 'Превышен лимит операций по продукту для плательщика',
        [this.INTERNAL_ERROR]: 'внутренняя ошибка',
        [this.TECHNICAL_PROBLEM]: 'операция отклонена по техническим причинам',
        [this.VALIDATION_ERROR]: 'ошибка при расчёте параметров платежа',
        [this.VALIDATION_ERROR_WRONG_TUPLE]: 'Неверная цепочка комиссий',
        [this.VALIDATION_ERROR_WRONG_OBJECT]: 'Неверный объект комиссий',
        [this.VALIDATION_ERROR_WRONG_SUB_LENGTH]: 'Длина цепочки комиссий не совпадает с длиной субсхемы',
        [this.VALIDATION_ERROR_WRONG_COM_SETTINGS]: 'Неверные настройки максимальной комиссии по серверу',
        [this.VALIDATION_ERROR_WRONG_COM_SETTINGS_API]: 'Неверные настройки комиссии для API точки',
        [this.VALIDATION_ERROR_WRONG_CALCULATE]: 'Требуемая сумма + комиссии не совпали с внесённой суммой',
        [this.VALIDATION_ERROR_WRONG_SUMS]: 'С терминала поступили неверные значения требуемой и внесённой сумм',
        [this.VALIDATION_ERROR_UPPER_LIMIT]: 'Превышено ограничение на сумму платежа сервером поставщика',
        [this.VALIDATION_ERROR_LOWER_LIMIT]: 'Сумма платежа меньше ограничения сервера поставщика',
        [this.VALIDATION_ERROR_DAILY_INNER_LIMIT]: 'Превышено 24-часовое ограничение (внутренние сервисы)',
        [this.VALIDATION_ERROR_MONTHY_INNER_LIMIT]: 'Превышено 30-дневное ограничение (внутренние сервисы)',
        [this.VALIDATION_ERROR_DAILY_OUTER_LIMIT]: 'Превышено 24-часовое ограничение (внешние сервисы)',
        [this.VALIDATION_ERROR_MONTHLY_OUTER_LIMIT]: 'Превышено 30-дневное ограничение (внешние сервисы)',
        [this.REPEAT_PAYMENT]: 'повтор платежа',
        [this.DOUBLE_PAYMENT]: 'двойной платеж',
        [this.NOT_CONFIRMED_PAYMENT]: 'Не подтвержденный платеж',
        [this.RETURN_MONEY]: 'возврат денег',
        [this.CANCEL_PAYMENT]: 'отмена платежа',
        [this.CANCELING_PAYMENT]: 'Платёж в состоянии отмены',
        [this.CANCELED]: 'отменен на стороне ПУ и в системе QP',
        [this.CANCELLATION_NOT_POSSIBLE]: 'отмена платежа невозможна',
        [this.CANCELLATION_NOT_SUPPORTED]: 'отмена платежа не поддерживается со стороны ПУ',
        [this.CANCELLATION_PERIOD_EXPIRED]: 'закончился период отмены платежа',
        [this.FISHY_PAYMENT]: 'Подозрительный платеж (проверка по спискам ГСФР)',
        [this.WAIT]: 'ожидание',
        [this.PASS_WAIT]: 'ожидание без обновления платежа',
        [this.UNKNOWN]: 'неизвестная ошибка'
    };

    /**
     * Получение описания ошибки
     * @param {number|string} n
     * @returns {string}
     */
    static getError(n) {
        const code = Number(n);

        if (this.descriptions.hasOwnProperty(code)) {
            return this.descriptions[code];
        }

        return `Ошибка #${n}`;
    }
}
