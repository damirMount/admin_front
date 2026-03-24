import dayjs from "dayjs";

const FormatDate = (date) => {
    if (!date) {
        return '—';
    }

    const d = dayjs(date);

    if (d.isValid()) {
        return d.format('DD.MM.YY HH:mm:ss');
    }

    return date;
};

export default FormatDate
