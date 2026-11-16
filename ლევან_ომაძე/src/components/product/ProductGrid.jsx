import { ProductCard } from './ProductCard';
export function ProductGrid({ products, onAdd }) {
    return (<ul className="grid list-none grid-cols-1 gap-5 min-[481px]:grid-cols-2 min-[1025px]:grid-cols-4">
      {products.map((product) => (<li key={product.id}>
          <ProductCard product={product} onAdd={onAdd}/>
        </li>))}
    </ul>);
}
