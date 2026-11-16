export function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
export function isValidPhone(phone) {
    const digitsOnly = phone.replace(/[\s+-]/g, '');
    return digitsOnly.length >= 9 && digitsOnly.length <= 15;
}
