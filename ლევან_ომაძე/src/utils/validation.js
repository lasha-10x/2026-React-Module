export function validateLogin(values) {
    const errors = {};
    if (values.username.trim() === '') {
        errors.username = 'Username is required';
    }
    if (values.password === '') {
        errors.password = 'Password is required';
    }
    else if (values.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
    }
    return errors;
}
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function validateCheckout(values) {
    const errors = {};
    if (values.fullName.trim().length < 3) {
        errors.fullName = 'Full name must be at least 3 characters';
    }
    const email = values.email.trim();
    if (!emailPattern.test(email)) {
        errors.email = 'Please enter a valid email address';
    }
    if (values.address.trim().length < 5) {
        errors.address = 'Address must be at least 5 characters';
    }
    if (values.city.trim() === '') {
        errors.city = 'City is required';
    }
    return errors;
}
