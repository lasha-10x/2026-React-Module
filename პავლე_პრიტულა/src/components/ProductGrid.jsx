import { useCart } from '../context/CartContext';
import ProductCard from './ProductCard';
function ProductGrid({ products, prioritizeFirstImage = false }) {
    const { items, addItem } = useCart();
    return (<div className="product-grid">
      {products.map((product, index) => (<ProductCard key={product.id} product={product} prioritizeImage={prioritizeFirstImage && index === 0} quantityInCart={items.find((item) => item.productId === product.id)?.quantity ?? 0} onAdd={addItem}/>))}
    </div>);
}
export default ProductGrid;
