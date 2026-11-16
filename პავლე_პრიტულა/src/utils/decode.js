export function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
export function isNonnegativeNumber(value) {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}
export function isNonnegativeInteger(value) {
    return isNonnegativeNumber(value) && Number.isSafeInteger(value);
}
export function isDiscount(value) {
    return isNonnegativeNumber(value) && value <= 100;
}
