export function getRedirectPath(state) {
    if (typeof state === 'object' &&
        state !== null &&
        'from' in state &&
        typeof state.from === 'string') {
        return state.from;
    }
    return '/';
}
