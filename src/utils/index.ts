export const formatValue = (event: any, type: string, subType = false) => {
    let value = event.target.value;
    if (!value) return '';
    if (type === 'allCaps') {
        value = value.split(' ').map((v: string) => v.substring(0, 1).toUpperCase() + v.substring(1).toLowerCase()).join(' ')
        if (subType)
            value = value.replace(/[^0-9a-zA-Z]/g, () => {
                return '';
            });
    }
    else if (type === "firstCaps") {
        value = value.replace(/^./, value[0].toUpperCase());
        if (subType)
            value = value.replace(/[^0-9a-zA-Z]/g, () => {
                return '';
            });
    }
    else if (type === "onlyNo")
        value = value.replace(/[^0-9]/g, () => {
            return '';
        });
    else if (type === "noWithDot")
        value = value.replace(/[^0-9.]/g, () => {
            return '';
        });
    else if (type === "code")
        value = value.replace(/[^0-9a-zA-Z]/g, () => {
            return '';
        });
    else if (type === "toUpperCase")
        value = value.toUpperCase()
    else if (type === "toLowerCase")
        value = value.toLowerCase()
    return value
};
