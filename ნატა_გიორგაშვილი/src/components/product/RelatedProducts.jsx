import { useEffect, useState } from 'react';
import { getProducts } from '../../api/products.api';
import ProductGrid from './ProductGrid';
export default function RelatedProducts({ category, currentId }) {
    const [state, setState] = useState({ status: 'loading' });
    useEffect(() => {
        const controller = new AbortController();
        getProducts({ limit: 5, skip: 0, category }, controller.signal)
            .then((data) => {
            const related = data.products.filter((product) => product.id !== currentId).slice(0, 4);
            setState({ status: 'success', data: related });
        })
            .catch(() => {
            if (controller.signal.aborted)
                return;
            setState({ status: 'error', message: 'Could not load related products.' });
        });
        return () => controller.abort();
    }, [category, currentId]);
    if (state.status !== 'success' || state.data.length === 0)
        return null;
    return (<section className="mt-10">
      <h2 className="text-xl font-bold">Related products</h2>
      <div className="mt-4">
        <ProductGrid products={state.data}/>
      </div>
    </section>);
}
