import { usdToCents } from './money.js';
const usd = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
});
export function formatPrice(value) {
    const cents = usdToCents(value);
    if (cents === null)
        throw new RangeError('Invalid USD amount.');
    return usd.format(cents / 100);
}
