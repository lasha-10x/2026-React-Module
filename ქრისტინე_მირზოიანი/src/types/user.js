export function isAuthUser(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    const user = value;
    return typeof user.username === 'string'
        && typeof user.isLoggedIn === 'boolean'
        && (user.firstName === undefined || typeof user.firstName === 'string')
        && (user.lastName === undefined || typeof user.lastName === 'string')
        && (user.email === undefined || typeof user.email === 'string')
        && (user.phone === undefined || typeof user.phone === 'string');
}
