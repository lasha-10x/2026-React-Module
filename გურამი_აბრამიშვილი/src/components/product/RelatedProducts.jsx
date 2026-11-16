import { relatedPath } from "@/api/endpoints";
import { useFetch } from "@/hooks/useFetch";
import { useAddToCart } from "@/hooks/useAddToCart";
import ProductGrid from "./ProductGrid";
// The SAME ProductCard as the catalog, reused: proof of component composition.
export default function RelatedProducts({ product }) {
    const { state } = useFetch(relatedPath(product.category));
    const addToCart = useAddToCart();
    if (state.status !== "success")
        return null;
    const related = state.data.products.filter((p) => p.id !== product.id).slice(0, 4);
    if (related.length === 0)
        return null;
    return (<section className="mt-12" aria-labelledby="related-heading">
      <h2 id="related-heading" className="mb-4 text-xl font-bold">
        Related products
      </h2>
      <ProductGrid products={related} onAdd={(p) => addToCart(p)}/>
    </section>);
}
