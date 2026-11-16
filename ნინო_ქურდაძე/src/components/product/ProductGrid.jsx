import { ProductCard } from "./ProductCard";
export const ProductGrid = ({ products, startIndex = 0, onAdd }) => {
    return (<div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product, idx) => (<ProductCard key={product.id} product={product} index={startIndex + idx} onAdd={onAdd}/>))}
    </div>);
};
