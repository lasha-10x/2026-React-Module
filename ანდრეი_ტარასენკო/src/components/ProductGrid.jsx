import ProductCard from './ProductCard';
function ProductGrid({ products, onAddToCart }) {
    if (products.length === 0) {
        return <p className="text-gray-600">No products found.</p>;
    }
    return (<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product, index) => (<ProductCard key={product.id} product={product} onAddToCart={onAddToCart} priority={index === 0}/>))}
    </div>);
}
export default ProductGrid;
