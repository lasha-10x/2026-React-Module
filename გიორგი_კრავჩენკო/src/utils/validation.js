/**
 * Form validation (Annex A, P1.2 and P5.2).
 *
 * Every message below is the exact text the specification requires, so these
 * strings are the single source of truth for both forms.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 6;
export const USERNAME_MIN_LENGTH = 3;
const FULL_NAME_MIN_LENGTH = 3;
const ADDRESS_MIN_LENGTH = 5;
/** Login: username is required, password must be at least 6 characters. */
export function validateLogin(values) {
    const errors = {};
    if (values.username.trim().length === 0) {
        errors.username = 'Username is required';
    }
    if (values.password.length === 0) {
        errors.password = 'Password is required';
    }
    else if (values.password.length < PASSWORD_MIN_LENGTH) {
        errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
    }
    return errors;
}
/**
 * Sign up: a username long enough to be worth claiming, a password at the
 * same minimum length Login enforces, and a confirmation that matches.
 *
 * Whether the username is already taken is not decided here — that depends on
 * what is stored, and this module stays a pure function of its input. The
 * context answers that question.
 */
export function validateSignUp(values) {
    const errors = {};
    const username = values.username.trim();
    if (username.length === 0) {
        errors.username = 'Username is required';
    }
    else if (username.length < USERNAME_MIN_LENGTH) {
        errors.username = `Username must be at least ${USERNAME_MIN_LENGTH} characters`;
    }
    if (values.password.length === 0) {
        errors.password = 'Password is required';
    }
    else if (values.password.length < PASSWORD_MIN_LENGTH) {
        errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
    }
    if (values.confirmPassword.length === 0) {
        errors.confirmPassword = 'Please confirm your password';
    }
    else if (values.confirmPassword !== values.password) {
        errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
}
/** Checkout: the four CORE shipping fields. */
export function validateCheckout(values) {
    const errors = {};
    if (values.fullName.trim().length < FULL_NAME_MIN_LENGTH) {
        errors.fullName = `Full name must be at least ${FULL_NAME_MIN_LENGTH} characters`;
    }
    if (!EMAIL_PATTERN.test(values.email.trim())) {
        errors.email = 'Please enter a valid email address';
    }
    if (values.address.trim().length < ADDRESS_MIN_LENGTH) {
        errors.address = `Address must be at least ${ADDRESS_MIN_LENGTH} characters`;
    }
    if (values.city.trim().length === 0) {
        errors.city = 'City is required';
    }
    return errors;
}
/** True when a validator returned at least one message. */
export function hasErrors(errors) {
    return Object.values(errors).some((message) => message !== undefined);
}
export const COMMENT_MIN_LENGTH = 10;
/** Reviews: a star must be chosen and the comment must say something. */
export function validateReview(values) {
    const errors = {};
    if (!Number.isInteger(values.rating) || values.rating < 1 || values.rating > 5) {
        errors.rating = 'Please select a rating';
    }
    if (values.comment.trim().length < COMMENT_MIN_LENGTH) {
        errors.comment = `Comment must be at least ${COMMENT_MIN_LENGTH} characters`;
    }
    return errors;
}
const NAME_MIN_LENGTH = 2;
const PHONE_PATTERN = /^\+?[\d\s]{9,15}$/;
/** Profile: names and email required, phone optional but checked if given. */
export function validateProfile(values) {
    const errors = {};
    if (values.firstName.trim().length < NAME_MIN_LENGTH) {
        errors.firstName = `First name must be at least ${NAME_MIN_LENGTH} characters`;
    }
    if (values.lastName.trim().length < NAME_MIN_LENGTH) {
        errors.lastName = `Last name must be at least ${NAME_MIN_LENGTH} characters`;
    }
    if (!EMAIL_PATTERN.test(values.email.trim())) {
        errors.email = 'Please enter a valid email address';
    }
    // Optional: an empty phone is fine, a malformed one is not.
    const phone = values.phone.trim();
    if (phone !== '' && !PHONE_PATTERN.test(phone)) {
        errors.phone = 'Please enter a valid phone number';
    }
    return errors;
}
