export function MoneyFormatNumber(num, formatType = 'short') {
    // Функция усечения числа до указанного количества знаков после запятой
    function truncate(number, digits) {
        const factor = Math.pow(10, digits);
        return Math.floor(number * factor) / factor;
    }

    // Определяем форматировщик для чисел
    const formatter = new Intl.NumberFormat('ru-RU', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
        useGrouping: true,
    });

    if (formatType === 'full') {
        return formatter.format(num); // Исправлено: теперь возвращает строку
    }

    if (num >= 1e9) {
        return formatter.format(truncate(num / 1e9, 2)) + ' млрд';
    } else if (num >= 1e6) {
        return formatter.format(truncate(num / 1e6, 2)) + ' млн';
    } else if (num >= 1e3) {
        return formatter.format(truncate(num / 1e3, 2)) + 'к';
    } else {
        return formatter.format(num);
    }
}
