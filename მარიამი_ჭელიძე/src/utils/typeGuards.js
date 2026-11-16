import { ApiError } from "../api/ApiError";
/** უცნობი შეცდომის ApiError-ად უსაფრთხოდ ამოცნობაში გვეხმარება. */
export function isApiError(error) {
    if (error instanceof ApiError) {
        return true;
    }
    if (typeof error !== "object" || error === null || !("status" in error)) {
        return false;
    }
    return typeof error.status === "number";
}
