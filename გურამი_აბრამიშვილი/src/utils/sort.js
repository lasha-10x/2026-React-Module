function compare(sort) {
    switch (sort) {
        case "price-asc":
            return (a, b) => a.price - b.price;
        case "price-desc":
            return (a, b) => b.price - a.price;
        case "rating-desc":
            return (a, b) => b.rating - a.rating;
        case "title-asc":
            return (a, b) => a.title.localeCompare(b.title);
    }
}
// Some DummyJSON endpoints may ignore sortBy/order. We trust the server first and only
// re-sort the current page on the client when the response is not already in order.
export function ensureSorted(products, sort) {
    if (sort === "")
        return products;
    const cmp = compare(sort);
    const alreadySorted = products.every((p, i) => i === 0 || cmp(products[i - 1], p) <= 0);
    return alreadySorted ? products : [...products].sort(cmp);
}
