import ProductCard from "./ProductCard.jsx";
// The ProductGrid component displays a grid of ProductCard components for each product in the products array
function ProductGrid({ products }) {
    return (<div className="grid grid-cols-1 gap-x-10 gap-y-14 py-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (<ProductCard key={product.id} product={product}/>))}
    </div>);
}
export default ProductGrid;
