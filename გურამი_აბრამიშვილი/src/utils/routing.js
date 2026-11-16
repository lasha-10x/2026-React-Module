import { isRecord } from "./guards";
// location.state is `unknown`; narrow it instead of casting.
export function getFromPath(state) {
    if (isRecord(state) && typeof state.from === "string" && state.from.startsWith("/")) {
        return state.from;
    }
    return "/";
}
export function getBooleanFlag(state, key) {
    return isRecord(state) && state[key] === true;
}
export function getStringFlag(state, key) {
    return isRecord(state) && typeof state[key] === "string" ? state[key] : null;
}
// "/products/abc", "/products/-1", "/products/1.5" are not valid ids.
export function parsePositiveInt(raw) {
    if (raw === undefined || !/^\d+$/.test(raw))
        return null;
    const value = Number(raw);
    return Number.isSafeInteger(value) && value > 0 ? value : null;
}
