import ProductCard from './ProductCard';
function ProductGrid({ products, headingLevel }) {
    return (<ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:mt-10 sm:grid-cols-2 sm:gap-y-12 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (<li key={product.id} className="min-w-0">
          <ProductCard product={product} headingLevel={headingLevel}/>
        </li>))}
    </ul>);
}
export default ProductGrid;
