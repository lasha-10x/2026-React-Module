import ProductCard from './ProductCard';
/**
 * TW3 — mobile-first grid: 1 column on phones, 2 from 640px, 3 from 768px,
 * 4 from 1024px. key = product.id: stable and unique (never the array index).
 */
export default function ProductGrid({ products, onAdd }) {
    return (<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (<ProductCard key={product.id} product={product} onAdd={onAdd}/>))}
    </div>);
}
