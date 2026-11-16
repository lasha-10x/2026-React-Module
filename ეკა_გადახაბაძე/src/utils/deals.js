/**
 * The in-stock product with the biggest discount, or null if there is none.
 * reduce walks the list once and keeps the best product seen so far.
 */
export function getBestDeal(products) {
    return products
        .filter((product) => product.stock > 0)
        .reduce((best, product) => (best === null || product.discountPercentage > best.discountPercentage ? product : best), null);
}
