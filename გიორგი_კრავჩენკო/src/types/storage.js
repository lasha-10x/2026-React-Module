/**
 * Storage locations and what delivery from them costs.
 *
 * The shop keeps its stock in a handful of warehouses rather than nowhere in
 * particular, so an order has somewhere to travel from. Which warehouse a
 * product sits in is decided by its category - the taxonomy in
 * `src/data/warehouses.ts` - and what the journey costs is decided by the
 * distance between that warehouse's city and the customer's.
 */
