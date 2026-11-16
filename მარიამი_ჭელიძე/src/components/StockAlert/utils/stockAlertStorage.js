// პროდუქტების მარაგის შეტყობინების ელფოსტებს localStorage-ში ინახავს.
const STOCK_ALERTS_KEY = "middle-market-stock-alerts";
function readAllStockAlerts() {
    // შენახულ მნიშვნელობას ვამოწმებთ, რადგან localStorage-ში JSON შეიძლება დაზიანებული იყოს.
    try {
        const parsed = JSON.parse(localStorage.getItem(STOCK_ALERTS_KEY) ?? "{}");
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
            return {};
        return Object.fromEntries(Object.entries(parsed).filter(([, emails]) => Array.isArray(emails) && emails.every((email) => typeof email === "string")));
    }
    catch {
        return {};
    }
}
export function getStockAlertEmails(productId) {
    return readAllStockAlerts()[String(productId)] ?? [];
}
export function subscribeToStockAlert(productId, email) {
    // ერთსა და იმავე ელფოსტას ერთი პროდუქტისთვის ორჯერ არ ვინახავთ.
    const normalizedEmail = email.trim().toLowerCase();
    const subscriptions = readAllStockAlerts();
    const productKey = String(productId);
    const currentEmails = subscriptions[productKey] ?? [];
    if (currentEmails.some((savedEmail) => savedEmail.toLowerCase() === normalizedEmail))
        return;
    subscriptions[productKey] = [...currentEmails, normalizedEmail];
    localStorage.setItem(STOCK_ALERTS_KEY, JSON.stringify(subscriptions));
}
