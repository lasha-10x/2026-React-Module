import { ConflictException, ServiceUnavailableException } from '@nestjs/common';
import { usdToCents } from './money';
export async function getCatalogProduct(id, signal) {
    let response;
    let data;
    try {
        // Only validated integer IDs enter a fixed URL; redirects cannot change the upstream host.
        response = await fetch(`https://dummyjson.com/products/${id}`, {
            signal, redirect: 'error', cache: 'no-store',
        });
        if (response.status === 404)
            throw new ConflictException('A requested product is no longer available.');
        if (!response.ok)
            throw new Error('Catalog HTTP failure');
        data = await response.json();
    }
    catch (error) {
        if (error instanceof ConflictException)
            throw error;
        throw new ServiceUnavailableException('The product catalog is unavailable. Please try again later.');
    }
    if (typeof data !== 'object' || data === null || Array.isArray(data))
        throw invalidCatalog();
    const product = data;
    const cents = usdToCents(product.price);
    if (product.id !== id || typeof product.title !== 'string' || !product.title.trim()
        || product.title.length > 500 || cents === null
        || typeof product.stock !== 'number' || !Number.isSafeInteger(product.stock) || product.stock < 0
        || typeof product.availabilityStatus !== 'string'
        || !['In Stock', 'Low Stock', 'Out of Stock'].includes(product.availabilityStatus)) {
        throw invalidCatalog();
    }
    if (product.stock === 0 || product.availabilityStatus === 'Out of Stock') {
        throw new ConflictException('A requested product is out of stock.');
    }
    return { id, title: product.title, unitPriceCents: cents, stock: product.stock };
}
function invalidCatalog() {
    return new ServiceUnavailableException('The product catalog returned invalid data. Please try again later.');
}
