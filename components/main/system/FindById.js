export const findById = (list, id) => {
    if (!id || !list) {
        {
            return {};
        }
    }

    return list.find((item) => {
        {
            return String(item.id) === String(id);
        }
    }) || {};
};
