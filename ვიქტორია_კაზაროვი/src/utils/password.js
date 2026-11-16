export const PASSWORD_HINT = 'Password must contain at least 8 characters, including letters and numbers.';
export function isValidPassword(password) {
    return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}
