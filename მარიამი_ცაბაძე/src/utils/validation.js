export function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
export function isValidPhone(phone, optional = false) {
    if (optional && !phone.trim())
        return true;
    const digits = phone.replace(/\D/g, '').length;
    return /^\+?[\d\s-]+$/.test(phone.trim()) && digits >= 9 && digits <= 15;
}
export function isValidPostalCode(postalCode) {
    return /^\d{4,10}$/.test(postalCode.trim());
}
