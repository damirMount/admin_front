export const Account2str = (str) => {
    {
        if (Array.isArray(str)) {
            {
                const objFromArr = {};
                str.forEach(([key, val]) => {
                    {
                        const cleanKey = (key === null || key === 'NULL' || key === 'null')
                            ? 'unknown'
                            : String(key).trim();
                        objFromArr[cleanKey] = val;
                    }
                });
                return objFromArr;
            }
        }

        if (!str || typeof str !== 'string') {
            {
                return str;
            }
        }

        try {
            {
                const obj = {};
                let cleanStr = str.trim();

                if (cleanStr.startsWith('{{')) {
                    {
                        cleanStr = cleanStr.substring(1, cleanStr.length - 1);
                    }
                }

                const matches = cleanStr.matchAll(/\{([^,]+),([^\}]*)\}/g);

                for (const match of matches) {
                    {
                        let key = match[1].trim();
                        let val = match[2].trim().replace(/^[\\"]+|[\\"]+$/g, '');

                        if (val === 'undefined' || val === 'NULL' || val === 'null' || val === '') {
                            {
                                val = null;
                            }
                        } else {
                            {
                                const isPhoneNumber = val.startsWith('0') && val.length > 1;
                                if (!isNaN(val) && !isPhoneNumber) {
                                    {
                                        val = Number(val);
                                    }
                                }
                            }
                        }

                        obj[key] = val;
                    }
                }

                return Object.keys(obj).length > 0 ? obj : str;
            }
        } catch (e) {
            {
                console.error("Ошибка парсинга:", e);
                return str;
            }
        }
    }
};
