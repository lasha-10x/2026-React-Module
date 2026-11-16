const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?[\d ]+$/;
export function isValidEmail(value) {
    return EMAIL_PATTERN.test(value.trim());
}
/** 9–15 digits; a leading + and spaces are allowed. */
export function isValidPhone(value) {
    const trimmed = value.trim();
    const digits = trimmed.replace(/\D/g, "");
    return PHONE_PATTERN.test(trimmed) && digits.length >= 9 && digits.length <= 15;
}
export function hasErrors(errors) {
    return Object.values(errors).some(Boolean);
}
export function validateCheckout(values) {
    const errors = {};
    if (values.fullName.trim().length < 3)
        errors.fullName = "Full name must be at least 3 characters";
    if (!isValidEmail(values.email))
        errors.email = "Please enter a valid email address";
    if (values.address.trim().length < 5)
        errors.address = "Address must be at least 5 characters";
    if (!values.city.trim())
        errors.city = "City is required";
    return errors;
}
export function validateProfile(values) {
    const errors = {};
    if (values.firstName.trim().length < 2)
        errors.firstName = "First name must be at least 2 characters";
    if (values.lastName.trim().length < 2)
        errors.lastName = "Last name must be at least 2 characters";
    if (!isValidEmail(values.email))
        errors.email = "Please enter a valid email address";
    if (values.phone.trim() && !isValidPhone(values.phone))
        errors.phone = "Please enter a valid phone number";
    return errors;
}
export function validateReview(values) {
    const errors = {};
    if (values.rating < 1 || values.rating > 5)
        errors.rating = "Please select a rating";
    if (values.comment.trim().length < 10)
        errors.comment = "Comment must be at least 10 characters";
    return errors;
}
