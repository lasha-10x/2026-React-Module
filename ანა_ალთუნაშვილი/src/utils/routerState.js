import { isRecord } from './guards/common';
/** React Router's location.state is `unknown`: narrow it instead of casting. */
/** Where to go after login (set by ProtectedRoute). */
export function getFromPath(state) {
    return isRecord(state) && typeof state.from === 'string' ? state.from : null;
}
/** A short message another page wants this page to show. */
export function getNotice(state) {
    return isRecord(state) && typeof state.notice === 'string' ? state.notice : null;
}
/** True when the page was opened right after placing an order. */
export function wasJustPlaced(state) {
    return isRecord(state) && state.justPlaced === true;
}
