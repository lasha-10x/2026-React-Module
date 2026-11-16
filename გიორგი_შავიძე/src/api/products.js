// დამხმარე ფუნქცია ლოკალურად შეცვლილი მარაგების გასაახლებლად
function applyStockOverrides(products) {
    const overrides = JSON.parse(localStorage.getItem("shop_stock_overrides") || "{}");
    return products.map((product) => {
        if (overrides[product.id] !== undefined) {
            return { ...product, stock: overrides[product.id] };
        }
        return product;
    });
}
export async function fetchAllProducts() {
    const response = await fetch("https://dummyjson.com/products?limit=0");
    if (!response.ok) {
        throw new Error("Failed to fetch products");
    }
    const data = await response.json();
    return applyStockOverrides(data.products);
}
export async function fetchProducts(limit = 12, skip = 0, category = "") {
    const url = category
        ? `https://dummyjson.com/products/category/${category}?limit=${limit}&skip=${skip}`
        : `https://dummyjson.com/products?limit=${limit}&skip=${skip}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Failed to fetch products");
    }
    const data = await response.json();
    return {
        ...data,
        products: applyStockOverrides(data.products),
    };
}
export async function fetchCategories() {
    const response = await fetch("https://dummyjson.com/products/categories");
    if (!response.ok) {
        throw new Error("Failed to fetch categories");
    }
    const data = await response.json();
    return data.map((cat) => typeof cat === "string"
        ? { slug: cat, name: cat }
        : {
            slug: cat.slug,
            name: cat.name,
        });
}
export async function fetchProductById(id) {
    const response = await fetch(`https://dummyjson.com/products/${id}`);
    if (!response.ok) {
        throw new Error("Failed to fetch product details");
    }
    const product = await response.json();
    const overrides = JSON.parse(localStorage.getItem("shop_stock_overrides") || "{}");
    if (overrides[product.id] !== undefined) {
        return { ...product, stock: overrides[product.id] };
    }
    return product;
}
