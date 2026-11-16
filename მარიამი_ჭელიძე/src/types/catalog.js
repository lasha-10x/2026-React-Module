// კატალოგის ძიების, დახარისხების, კატეგორიებისა და გვერდების ტიპებს განსაზღვრავს.
export const CATALOG_PAGE_SIZE = 12;
export function isCatalogSortOption(value) {
    return ["", "price-asc", "price-desc", "rating-desc", "title-asc"].includes(value);
}
