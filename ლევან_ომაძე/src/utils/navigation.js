function readStringField(state, field) {
    if (typeof state !== 'object' || state === null) {
        return null;
    }
    const value = state[field];
    return typeof value === 'string' ? value : null;
}
export function getRedirectPath(state) {
    return readStringField(state, 'from');
}
export function getStateMessage(state) {
    return readStringField(state, 'message');
}
