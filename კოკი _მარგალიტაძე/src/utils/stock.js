export const LOW_STOCK_LIMIT = 5;
export function getStockStatus(product) {
    if (product.stock === 0)
        return 'out-of-stock';
    if (product.stock <= LOW_STOCK_LIMIT)
        return 'low-stock';
    return 'in-stock';
}
export const STOCK_CLASSES = {
    'in-stock': 'text-green-600',
    'low-stock': 'text-orange-500',
    'out-of-stock': 'text-red-600',
};
export function stockLabel(product) {
    const status = getStockStatus(product);
    if (status === 'out-of-stock')
        return 'Out of stock';
    if (status === 'low-stock')
        return `Only ${product.stock} left!`;
    return 'In stock';
}
