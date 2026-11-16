// one place for date formatting, so every page shows dates the same way (11/4/2026)
const dateFormatter = new Intl.DateTimeFormat("en-US");
const dateTimeFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "short", timeStyle: "short" });
export function formatDate(iso) {
    return dateFormatter.format(new Date(iso));
}
export function formatDateTime(iso) {
    return dateTimeFormatter.format(new Date(iso));
}
