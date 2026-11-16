import ProductCard from './ProductCard';
export default function ProductGrid({ products, onAdd }) {
    return (<ul className="grid grid-cols-1 gap-x-6 gap-y-14 min-[481px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (<li key={product.id}>
          <ProductCard product={product} onAdd={onAdd}/>
        </li>))}
    </ul>);
}
