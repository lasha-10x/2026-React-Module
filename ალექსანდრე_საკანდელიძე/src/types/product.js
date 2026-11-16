/**
 * NOTE: the shape of product data from the DummyJSON API.
 * Why it exists: TypeScript can only catch a mistake like `product.prize` if it knows the real shape.
 * Connects to: `api/products.api.ts` (fills these), and the cards and pages (read them).
 *
 * My rule for `interface` vs `type`, which the PRD says I'll be asked about: an object's shape that
 * could be extended uses `interface`. A union, an intersection or an alias uses `type`.
 */
