export const formatPrice = (amount, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
export const discountedPrice = (price, pct) => Math.max(0, price * (1 - pct / 100));
export const formatDate = (iso) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(iso));
export const getOrderStatus = (order, now = new Date()) => { const elapsed = now.getTime() - new Date(order.placedAt).getTime(); return elapsed < 60_000 ? 'Processing' : elapsed < 180_000 ? 'Shipped' : 'Delivered'; };
