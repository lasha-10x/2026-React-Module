export const initialAuthState = { status: 'authenticating', session: null, notice: null };
export function authReducer(_state, action) {
    if (action.type === 'begin')
        return { status: 'authenticating', session: null, notice: null };
    if (action.type === 'authenticated' && action.session.expiresAt > Date.now()) {
        return { status: 'authenticated', session: action.session, notice: null };
    }
    return { status: 'guest', session: null, notice: action.type === 'guest' ? action.notice ?? null : 'Your session has expired. Please sign in again.' };
}
export function canAccessAccount(state) {
    return state.status === 'authenticated' && state.session.expiresAt > Date.now();
}
