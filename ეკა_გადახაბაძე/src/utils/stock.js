/** P3.3 — stock > 5: in stock; 1–5: low; 0: out of stock. */
export function getStockLevel(stock) {
    if (stock === 0)
        return 'out';
    if (stock <= 5)
        return 'low';
    return 'in-stock';
}
export function getStockLabel(stock) {
    const level = getStockLevel(stock);
    if (level === 'out')
        return 'Out of stock';
    if (level === 'low')
        return `Only ${stock} left!`;
    return 'In stock';
}
