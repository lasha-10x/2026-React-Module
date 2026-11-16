const isRecord = (value) => {
    return typeof value === 'object' && value !== null;
};
export const isCartItem = (value) => {
    if (!isRecord(value)) {
        return false;
    }
    return (typeof value.productId === 'number' &&
        typeof value.title === 'string' &&
        typeof value.thumbnail === 'string' &&
        typeof value.price === 'number' &&
        typeof value.discountPercentage === 'number' &&
        typeof value.stock === 'number' &&
        typeof value.quantity === 'number');
};
const sortOptions = ['default', 'price-asc', 'price-desc', 'rating-desc'];
export const isSortOption = (value) => {
    return sortOptions.includes(value);
};
