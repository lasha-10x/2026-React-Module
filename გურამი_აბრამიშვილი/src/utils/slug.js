// "Essence Mascara Lash Princess" -> "essence-mascara-lash-princess"
export function slugify(text) {
    return text
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "") // "é" -> "e"
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-") // spaces, apostrophes, punctuation -> one dash
        .replace(/^-+|-+$/g, "");
}
// The one place that builds a product link: /products/essence-mascara-lash-princess
export function productUrl(product) {
    return `/products/${slugify(product.title)}`;
}
