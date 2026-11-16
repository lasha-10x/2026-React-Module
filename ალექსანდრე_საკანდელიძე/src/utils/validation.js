import { MIN_ADDRESS_LENGTH, MIN_FULL_NAME_LENGTH, MIN_NAME_LENGTH } from "./constants";
/** True when validation found nothing. An empty object means every field passed. */
export function hasNoErrors(errors) {
    return Object.keys(errors).length === 0;
}
/**
 * A simple email shape check: something, then @, then something with a dot. It can't prove an address
 * exists. Only sending a real email could, and this shop sends nothing.
 */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** True for a plausible phone number: an optional leading +, then 9 to 15 digits, with spaces allowed. */
function isValidPhone(phone) {
    return /^\+?\d{9,15}$/.test(phone.replace(/\s/g, ""));
}
/** PRD P7.2. Phone is optional, so it is only checked when something is typed in it. */
export function validateProfile(values) {
    const errors = {};
    if (values.firstName.trim().length < MIN_NAME_LENGTH) {
        errors.firstName = `First name must be at least ${MIN_NAME_LENGTH} characters`;
    }
    if (values.lastName.trim().length < MIN_NAME_LENGTH) {
        errors.lastName = `Last name must be at least ${MIN_NAME_LENGTH} characters`;
    }
    if (!EMAIL_PATTERN.test(values.email.trim())) {
        errors.email = "Please enter a valid email address";
    }
    if (values.phone.trim() !== "" && !isValidPhone(values.phone)) {
        errors.phone = "Please enter a valid phone number";
    }
    return errors;
}
/** PRD P5.2. Everything is trimmed first, so a field of only spaces doesn't count as filled in. */
export function validateCheckout(values) {
    const errors = {};
    if (values.fullName.trim().length < MIN_FULL_NAME_LENGTH) {
        errors.fullName = `Full name must be at least ${MIN_FULL_NAME_LENGTH} characters`;
    }
    if (!EMAIL_PATTERN.test(values.email.trim())) {
        errors.email = "Please enter a valid email address";
    }
    if (!isValidPhone(values.phone)) {
        errors.phone = "Please enter a valid phone number";
    }
    if (values.address.trim().length < MIN_ADDRESS_LENGTH) {
        errors.address = `Address must be at least ${MIN_ADDRESS_LENGTH} characters`;
    }
    if (values.city.trim() === "") {
        errors.city = "City is required";
    }
    if (!/^\d{4,10}$/.test(values.postalCode.trim())) {
        errors.postalCode = "Postal code must be 4-10 digits";
    }
    if (values.country === "") {
        errors.country = "Please select a country";
    }
    return errors;
}
