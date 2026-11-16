import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { productPath } from "@/api/endpoints";
import ProductGallery from "@/components/product/ProductGallery";
import PriceBlock from "@/components/product/PriceBlock";
import RelatedProducts from "@/components/product/RelatedProducts";
import ReviewsSection from "@/components/product/ReviewsSection";
import { ProductDetailsSkeleton } from "@/components/product/ProductSkeleton";
import StockBadge from "@/components/product/StockBadge";
import CompareButton from "@/components/product/CompareButton";
import ShareButton from "@/components/product/ShareButton";
import WishlistButton from "@/components/product/WishlistButton";
import Button from "@/components/ui/Button";
import QuantityStepper from "@/components/ui/QuantityStepper";
import Stars from "@/components/ui/Stars";
import Tabs from "@/components/ui/Tabs";
import { ErrorMessage } from "@/components/ui/StatusMessage";
import { useAddToCart } from "@/hooks/useAddToCart";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFetch } from "@/hooks/useFetch";
import { useProductLookup } from "@/hooks/useProductLookup";
import { useReviews } from "@/hooks/useReviews";
import { productUrl } from "@/utils/slug";
import { pluralize } from "@/utils/format";
import { parsePositiveInt } from "@/utils/routing";
import NotFoundPage from "./NotFoundPage";
export default function ProductPage() {
    const { id: param } = useParams(); // "essence-mascara-lash-princess" (or an old numeric link like "1")
    const legacyId = parsePositiveInt(param);
    const lookup = useProductLookup(legacyId === null && param !== undefined ? param : null);
    const productId = legacyId ?? (lookup.status === "found" ? lookup.id : null);
    // `productId` decides the request, so a new product means a new request (the classic "page changes, data does not" bug cannot happen).
    const { state, retry } = useFetch(productId === null ? null : productPath(productId));
    if (lookup.status === "missing")
        return <NotFoundPage />;
    if (lookup.status === "error")
        return <ErrorMessage message={lookup.message}/>;
    if (productId === null)
        return legacyId === null && param !== undefined ? <ProductDetailsSkeleton /> : <NotFoundPage />;
    if (state.status === "error" && state.statusCode === 404)
        return <NotFoundPage />;
    if (state.status === "error")
        return <ErrorMessage message={state.message} onRetry={retry}/>;
    if (state.status !== "success")
        return <ProductDetailsSkeleton />;
    // Old numeric link: show the same product under its name-based address.
    if (legacyId !== null)
        return <Navigate to={productUrl(state.data)} replace/>;
    // key = id: a different product gets a fresh component, so quantity / selected photo / tab reset.
    return <ProductDetails key={state.data.id} product={state.data}/>;
}
function ProductDetails({ product }) {
    useDocumentTitle(product.title);
    const navigate = useNavigate();
    const location = useLocation();
    const addToCart = useAddToCart();
    const { localReviews, addReview, updateReview, removeReview } = useReviews(product.id);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState("description");
    const [message, setMessage] = useState(null);
    const outOfStock = product.stock <= 0;
    // Local reviews first (newest on top), then the ones from the API.
    const allReviews = useMemo(() => [...localReviews, ...product.reviews], [localReviews, product.reviews]);
    const averageRating = useMemo(() => {
        if (allReviews.length === 0)
            return product.rating;
        return allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    }, [allReviews, product.rating]);
    function handleBack() {
        // "default" key = this is the first page of the session, so there is nothing to go back to.
        if (location.key === "default")
            navigate("/");
        else
            navigate(-1);
    }
    function handleAdd() {
        const result = addToCart(product, quantity);
        setMessage(result.ok ? { text: `Added ${pluralize(quantity, "item")} to cart ✓`, ok: true } : { text: result.message, ok: false });
    }
    return (<div>
      <button type="button" onClick={handleBack} className="mb-6 inline-flex min-h-11 items-center rounded text-sm font-medium text-accent hover:underline focus-ring">
        ← Back to catalog
      </button>

      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
        <ProductGallery title={product.title} images={product.images} thumbnail={product.thumbnail}/>

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm tracking-wide text-muted uppercase">
                {product.brand !== undefined && `${product.brand} · `}
                <Link to={`/?category=${encodeURIComponent(product.category)}`} className="rounded hover:text-accent hover:underline focus-ring">
                  {product.category}
                </Link>
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{product.title}</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Stars rating={averageRating}/>
            <span className="font-semibold">{averageRating.toFixed(1)}</span>
            <span className="text-muted">· {pluralize(allReviews.length, "review")}</span>
          </div>

          <PriceBlock price={product.price} discountPercentage={product.discountPercentage} size="lg"/>
          <StockBadge stock={product.stock}/>
          <p className="line-clamp-3 max-w-prose text-muted">{product.description}</p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <QuantityStepper value={quantity} max={Math.max(product.stock, 1)} onChange={setQuantity} disabled={outOfStock}/>
            <Button onClick={handleAdd} disabled={outOfStock} className="flex-1 sm:flex-none sm:px-8">
              {outOfStock ? "Out of stock" : "Add to cart"}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="More actions">
            <WishlistButton product={product} showLabel/>
            <CompareButton product={product}/>
            <ShareButton title={product.title} text={`Check out ${product.title} at 10X Shop`}/>
          </div>

          {message !== null && (<p role="status" className={`text-sm font-medium ${message.ok ? "text-success" : "text-danger"}`}>
              {message.text}
            </p>)}
        </div>
      </div>

      <div className="mt-10">
        <Tabs activeId={activeTab} onChange={setActiveTab} tabs={[
            {
                id: "description",
                label: "Description",
                content: (<div className="max-w-3xl space-y-4">
                  <p className="leading-relaxed text-muted">{product.description}</p>
                  <dl className="grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
                    {product.brand !== undefined && (<>
                        <dt className="text-muted">Brand</dt>
                        <dd>{product.brand}</dd>
                      </>)}
                    <dt className="text-muted">Category</dt>
                    <dd>{product.category}</dd>
                    <dt className="text-muted">Rating</dt>
                    <dd>{product.rating.toFixed(1)} / 5</dd>
                    <dt className="text-muted">Availability</dt>
                    <dd>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</dd>
                  </dl>
                </div>),
            },
            {
                id: "reviews",
                label: `Reviews (${allReviews.length})`,
                content: (<ReviewsSection reviews={allReviews} ownReviews={localReviews} onAdd={addReview} onUpdate={updateReview} onRemove={removeReview}/>),
            },
        ]}/>
      </div>

      <RelatedProducts product={product}/>
    </div>);
}
