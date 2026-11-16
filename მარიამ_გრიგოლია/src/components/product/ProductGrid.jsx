import { ProductCard } from "./ProductCard";
//products coz here we need more than one product we need some array of products!!!!(first - name secon- product.ts but with[] so more than one)
//here we use destructuring, where out of props whole obj we need only products
//we say props obj fully should follow ProductGridProps rules (interface products = func products props)
export function ProductGrid({ products, onAdd }) {
    return (<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (<ProductCard key={product.id} product={product} onAdd={onAdd}/>))}
    </div>);
}
