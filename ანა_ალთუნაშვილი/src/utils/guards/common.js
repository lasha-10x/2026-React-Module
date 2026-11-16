/**
 * JSON has no types: whatever comes from the network, localStorage or the router is `unknown`
 * until a type guard proves its shape. These tiny helpers are the building blocks.
 */
export function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
export function isArrayOf(value, guard) {
    return Array.isArray(value) && value.every(guard);
}
export function isOptionalString(value) {
    return value === undefined || typeof value === 'string';
}
