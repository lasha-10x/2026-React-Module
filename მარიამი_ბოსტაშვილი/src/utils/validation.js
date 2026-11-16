export const COUNTRIES = ["Georgia", "Armenia", "Azerbaijan", "Germany", "Turkey", "United Kingdom", "United States"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function isValidEmail(value) {
    return EMAIL_PATTERN.test(value.trim());
}
/** 9–15 digits; a leading + and spaces are allowed. */
export function isValidPhone(value) {
    const compact = value.trim().replace(/\s+/g, "");
    return /^\+?\d{9,15}$/.test(compact);
}
/** Checkout rules and exact messages from the specification (P5.2). */
export function validateShipping(fields) {
    const errors = {};
    if (fields.fullName.trim().length < 3)
        errors.fullName = "Full name must be at least 3 characters";
    if (!isValidEmail(fields.email))
        errors.email = "Please enter a valid email address";
    if (!isValidPhone(fields.phone))
        errors.phone = "Please enter a valid phone number";
    if (fields.address.trim().length < 5)
        errors.address = "Address must be at least 5 characters";
    if (!fields.city.trim())
        errors.city = "City is required";
    if (!/^\d{4,10}$/.test(fields.postalCode.trim()))
        errors.postalCode = "Postal code must be 4-10 digits";
    if (!fields.country)
        errors.country = "Please select a country";
    return errors;
}
