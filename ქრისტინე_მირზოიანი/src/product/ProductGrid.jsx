import { ProductCard } from './ProductCard';
export function ProductGrid({ products, onAdd }) {
    const priorityProductId = products[0]?.id;
    return (<div className="grid grid-cols-1 min-[481px]:grid-cols-2 min-[768px]:grid-cols-3 min-[1025px]:grid-cols-4 gap-4 sm:gap-5">
        {products.map((product) => (<ProductCard key={product.id} product={product} onAdd={onAdd} prioritizeImage={product.id === priorityProductId}/>))}
    </div>);
}
export default ProductGrid;
