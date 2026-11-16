export const sortProducts = (products, option) => {
    switch (option) {
        case 'default':
            return products;
        case 'price-asc':
            return [...products].sort((a, b) => a.price - b.price);
        case 'price-desc':
            return [...products].sort((a, b) => b.price - a.price);
        case 'rating-desc':
            return [...products].sort((a, b) => b.rating - a.rating);
        default:
            return products;
    }
};
