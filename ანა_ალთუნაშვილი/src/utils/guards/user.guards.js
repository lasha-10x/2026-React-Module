import { isOptionalString, isRecord } from './common';
export function isAuthUser(value) {
    return (isRecord(value) &&
        typeof value.username === 'string' &&
        typeof value.isLoggedIn === 'boolean' &&
        isOptionalString(value.firstName) &&
        isOptionalString(value.lastName) &&
        isOptionalString(value.email) &&
        isOptionalString(value.phone));
}
export function isTheme(value) {
    return value === 'light' || value === 'dark';
}
