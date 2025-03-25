import dayjs from 'dayjs';
import {DatePicker, Typography} from 'antd';
import {useEffect} from 'react';

const {Text} = Typography;
const {RangePicker} = DatePicker;

const DateRangePicker = ({startDate, endDate, onDateChange, size = 'large', allowClear = true}) => {
    const dateFormat = 'YYYY-MM-DD';

    // Формируем текущую дату в строковом формате без временной зоны
    const todayFormatted = dayjs().format(dateFormat);

    // Если startDate и endDate заданы, используем их, иначе – сегодняшнюю дату
    const defaultStart = startDate ? dayjs(startDate).format(dateFormat) : todayFormatted;
    const defaultEnd = endDate ? dayjs(endDate).format(dateFormat) : todayFormatted;

    useEffect(() => {
        onDateChange([defaultStart, defaultEnd]);
    }, []); // пустой массив зависимостей – эффект выполнится один раз

    return (
        <div className="d-flex flex-column">
            <Text type="secondary" className="mb-1">Период времени</Text>
            <RangePicker
                size={size}
                maxDate={dayjs(todayFormatted)}
                defaultValue={[dayjs(defaultStart), dayjs(defaultEnd)]}
                allowClear={allowClear}
                onChange={(dates) => {
                    if (!dates || dates.length < 2) return;

                    // Преобразуем даты в строки формата YYYY-MM-DD
                    const selectedStart = dates[0].format(dateFormat);
                    const selectedEnd = dates[1].format(dateFormat);

                    onDateChange([selectedStart, selectedEnd]);
                }}
            />
        </div>
    );
};

export default DateRangePicker;
