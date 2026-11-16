import ProductCard from "./ProductCard";
// Mobile-first grid following the spec breakpoints: <=480px 1 column, 481-1024px 2-3 columns, >1024px 4 columns.
// The ranges are written as mutually exclusive (min + max) so the result never depends on the order
// in which Tailwind emits the rules. The list layout is always one column.
export default function ProductGrid({ products, onAdd, layout = "grid" }) {
    const columns = layout === "list" ? "grid-cols-1" : "grid-cols-1 xs:max-lg:grid-cols-2 lg:max-desktop:grid-cols-3 desktop:grid-cols-4";
    return (<ul className={`grid gap-4 sm:gap-6 ${columns}`}>
      {products.map((product, i) => (<li key={product.id} className="flex">
          <ProductCard product={product} onAdd={onAdd} layout={layout} priority={i < 4}/>
        </li>))}
    </ul>);
}
