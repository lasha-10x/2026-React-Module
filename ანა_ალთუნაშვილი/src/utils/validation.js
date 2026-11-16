const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export function isValidEmail(value) {
    return EMAIL_PATTERN.test(value.trim());
}
/** 9-15 digits; a leading "+", spaces and dashes are allowed. */
export function isValidPhone(value) {
    const trimmed = value.trim();
    if (!/^\+?[\d\s-]+$/.test(trimmed))
        return false;
    const digits = trimmed.replace(/\D/g, '');
    return digits.length >= 9 && digits.length <= 15;
}
export function validateForm(values, validators) {
    const errors = {};
    for (const field of Object.keys(validators)) {
        const message = validators[field](values[field]);
        if (message)
            errors[field] = message;
    }
    return errors;
}
export function hasErrors(errors) {
    return Object.keys(errors).length > 0;
}
export const checkoutValidators = {
    fullName: (value) => value.trim().length >= 3 ? undefined : 'Full name must be at least 3 characters',
    email: (value) => (isValidEmail(value) ? undefined : 'Please enter a valid email address'),
    address: (value) => (value.trim().length >= 5 ? undefined : 'Address must be at least 5 characters'),
    city: (value) => (value.trim().length > 0 ? undefined : 'City is required'),
};
