import { Link, useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Stars from "@/components/ui/Stars";
import { productUrl } from "@/utils/slug";
import CompareButton from "./CompareButton";
import PriceBlock from "./PriceBlock";
import StockBadge from "./StockBadge";
import WishlistButton from "./WishlistButton";
export default function ProductCard({ product, onAdd, layout = "grid", priority = false }) {
    const navigate = useNavigate();
    const isList = layout === "list";
    const outOfStock = product.stock <= 0;
    // The whole card opens the details page, except clicks on buttons and links (they do their own thing).
    function handleCardClick(e) {
        if (e.target instanceof Element && e.target.closest("button, a") !== null)
            return;
        navigate(productUrl(product));
    }
    return (<article onClick={handleCardClick} className={`card group flex w-full cursor-pointer overflow-hidden transition-shadow hover:shadow-lg ${isList ? "flex-col sm:flex-row" : "flex-col"}`}>
      <div className={`relative shrink-0 bg-surface-2 ${isList ? "sm:w-56" : ""}`}>
        <img src={product.thumbnail} alt={product.title} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} width={400} height={400} className="aspect-square w-full object-contain transition-transform duration-300 group-hover:scale-105"/>
        <WishlistButton product={product} className="absolute top-2 right-2"/>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs tracking-wide text-muted uppercase">
          {product.category}
          {product.brand !== undefined && ` · ${product.brand}`}
        </p>
        <h2 className="line-clamp-2 min-h-[2.75rem] font-semibold">
          <Link to={productUrl(product)} className="rounded hover:text-accent focus-ring">
            {product.title}
          </Link>
        </h2>
        <div className="flex items-center gap-2 text-sm">
          <Stars rating={product.rating}/>
          <span className="text-muted">{product.rating.toFixed(1)}</span>
        </div>
        <PriceBlock price={product.price} discountPercentage={product.discountPercentage}/>
        <div>
          <StockBadge stock={product.stock}/>
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <Button className="flex-1 sm:flex-none" onClick={() => onAdd(product)} disabled={outOfStock}>
            {outOfStock ? "Out of stock" : "Add to cart"}
          </Button>
          <CompareButton product={product}/>
        </div>
      </div>
    </article>);
}
