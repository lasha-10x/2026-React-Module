/**
 * Checkout models.
 *
 * CORE checkout is exactly four controlled fields (Annex A, P5.1 and P5.2).
 * The withdrawn schema in the P5.2 table (phone, postal code, country, card
 * number, expiry, CVC) is not implemented: PRD rule 3 gives precedence to the
 * CORE/FULL definition over the detailed example, and PRD rule 7 rules out
 * any payment handling.
 */
