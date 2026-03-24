export const SafeParse = (data) => {
    if (typeof data === 'object' && data !== null) {
        {
            return data;
        }
    }

    try {
        {
            return JSON.parse(data || '{}');
        }
    } catch (e) {
        {
            return {};
        }
    }
};
