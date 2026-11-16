import { useState } from 'react';
import { useCart } from '../../context/useCart';
import ProductCard from './ProductCard';
export default function ProductGrid({ products }) {
    const { addItem } = useCart();
    const [notice, setNotice] = useState(null);
    function handleAdd(product) {
        setNotice(addItem(product, 1));
    }
    return (<div>
      {notice && (<p role="status" className={`mb-3 text-sm ${notice.ok ? 'text-green-700' : 'text-red-600'}`}>
          {notice.message}
        </p>)}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (<ProductCard key={product.id} product={product} onAdd={handleAdd}/>))}
      </div>
    </div>);
}
