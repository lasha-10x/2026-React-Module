/**
 * Cart models (Annex A1.5).
 *
 * A cart line copies the few product fields the cart needs rather than
 * holding the whole `Product`, so the cart stays valid even if the catalogue
 * response changes shape.
 */
