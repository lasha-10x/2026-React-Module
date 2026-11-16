// Card number helpers. Nothing here ever leaves the browser or gets stored.
export function digitsOnly(value) {
    return value.replace(/\D/g, "");
}
// Luhn algorithm (ISO/IEC 7812): walking from the right, double every second digit
// (subtracting 9 when the result is above 9); the number is valid when the sum is divisible by 10.
export function isValidLuhn(cardNumber) {
    const digits = cardNumber.replace(/[\s-]/g, "");
    if (!/^\d+$/.test(digits))
        return false;
    let sum = 0;
    let double = false;
    for (let i = digits.length - 1; i >= 0; i -= 1) {
        let digit = digits.charCodeAt(i) - 48;
        if (double) {
            digit *= 2;
            if (digit > 9)
                digit -= 9;
        }
        sum += digit;
        double = !double;
    }
    return sum % 10 === 0;
}
export function detectCardBrand(cardNumber) {
    const d = digitsOnly(cardNumber);
    if (/^4/.test(d))
        return "Visa";
    if (/^(5[1-5]|2(2[2-9][1-9]|2[3-9]\d|[3-6]\d{2}|7[01]\d|720))/.test(d))
        return "Mastercard";
    if (/^3[47]/.test(d))
        return "American Express";
    if (/^(6011|65|64[4-9])/.test(d))
        return "Discover";
    return "Unknown";
}
// "4242424242424242" -> "4242 4242 4242 4242" (Amex: 4-6-5). Input is capped at 19 digits.
export function formatCardNumber(value) {
    const d = digitsOnly(value).slice(0, 19);
    if (detectCardBrand(d) === "American Express") {
        return [d.slice(0, 4), d.slice(4, 10), d.slice(10, 15)].filter((g) => g !== "").join(" ");
    }
    return d.replace(/(.{4})/g, "$1 ").trim();
}
// "1228" -> "12/28"
export function formatExpiry(value) {
    const d = digitsOnly(value).slice(0, 4);
    return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`;
}
export function isValidExpiry(value, now = new Date()) {
    const match = /^(\d{2})\/(\d{2})$/.exec(value.trim());
    if (match === null)
        return false;
    const month = Number(match[1]);
    const year = 2000 + Number(match[2]);
    if (month < 1 || month > 12)
        return false;
    // A card is valid through the last day of its expiry month.
    return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
}
