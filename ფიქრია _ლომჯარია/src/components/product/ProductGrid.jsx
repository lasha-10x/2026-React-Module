import ProductCard from './ProductCard';
export default function ProductGrid({ products }) {
    return (<ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (<li key={product.id}>
          <ProductCard product={product}/>
        </li>))}
    </ul>);
}
