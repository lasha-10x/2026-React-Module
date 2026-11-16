export function addCartItem(items, product, quantity) {
    if (!Number.isSafeInteger(quantity) || quantity <= 0)
        return items;
    const existing = items.find((item) => item.productId === product.id);
    const nextQuantity = (existing?.quantity ?? 0) + quantity;
    if (nextQuantity > product.stock)
        return items;
    const nextItem = {
        productId: product.id,
        title: product.title,
        thumbnail: product.thumbnail,
        price: product.price,
        discountPercentage: product.discountPercentage,
        stock: product.stock,
        quantity: nextQuantity,
    };
    return existing
        ? items.map((item) => item.productId === product.id ? nextItem : item)
        : [...items, nextItem];
}
export function mergeLegacyPrices(items, prices) {
    return items.map((item) => {
        if (item.discountPercentage !== undefined)
            return item;
        const pricing = prices.find((price) => price.id === item.productId);
        return pricing ? { ...item, price: pricing.price, discountPercentage: pricing.discountPercentage } : item;
    });
}
