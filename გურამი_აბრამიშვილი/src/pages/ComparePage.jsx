import { Link } from "react-router-dom";
import PriceBlock from "@/components/product/PriceBlock";
import StockBadge from "@/components/product/StockBadge";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import PageHeading from "@/components/ui/PageHeading";
import Stars from "@/components/ui/Stars";
import { EmptyState } from "@/components/ui/StatusMessage";
import { useCompare } from "@/context/CompareContext";
import { useToast } from "@/context/ToastContext";
import { useAddToCart } from "@/hooks/useAddToCart";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { COMPARE_LIMIT } from "@/utils/constants";
import { discountedPrice } from "@/utils/format";
import { productUrl } from "@/utils/slug";
const BEST = "bg-success/10 font-semibold text-success";
const ROWS = [
    {
        label: "Price",
        render: (p) => <PriceBlock price={p.price} discountPercentage={p.discountPercentage}/>,
        best: (p, all) => discountedPrice(p.price, p.discountPercentage) === Math.min(...all.map((x) => discountedPrice(x.price, x.discountPercentage))),
    },
    {
        label: "Rating",
        render: (p) => (<span className="inline-flex items-center gap-2">
        <Stars rating={p.rating}/>
        {p.rating.toFixed(1)}
      </span>),
        best: (p, all) => p.rating === Math.max(...all.map((x) => x.rating)),
    },
    { label: "Availability", render: (p) => <StockBadge stock={p.stock}/> },
    { label: "Brand", render: (p) => p.brand ?? "-" },
    { label: "Category", render: (p) => p.category },
    { label: "Discount", render: (p) => (p.discountPercentage > 0 ? `${Math.round(p.discountPercentage)}%` : "-") },
    { label: "Reviews", render: (p) => p.reviews.length },
    { label: "Description", render: (p) => <span className="line-clamp-4 text-muted">{p.description}</span> },
];
export default function ComparePage() {
    useDocumentTitle("Compare");
    const { items, remove, clear } = useCompare();
    const { toast } = useToast();
    const addToCart = useAddToCart();
    return (<div>
      <PageHeading title="Compare products" subtitle={items.length === 0 ? undefined : `${items.length} of ${COMPARE_LIMIT} selected`}>
        {items.length > 0 && (<Button variant="secondary" size="sm" onClick={() => {
                clear();
                toast("Compare list cleared");
            }}>
            Clear compare
          </Button>)}
      </PageHeading>

      {items.length === 0 ? (<EmptyState title="Nothing to compare yet.">
          <p className="mb-3 text-sm text-muted">Press “Compare” on up to {COMPARE_LIMIT} products to see them side by side.</p>
          <ButtonLink to="/">Browse products</ButtonLink>
        </EmptyState>) : (<>
          {items.length === 1 && <p className="mb-4 text-sm text-muted">Add at least one more product to compare.</p>}
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[40rem] table-fixed border-collapse text-left text-sm">
              <caption className="sr-only">Product comparison. Best price and best rating are highlighted.</caption>
              <thead>
                <tr className="align-top">
                  <td className="w-28 p-3 sm:w-36"/>
                  {items.map((p) => (<th key={p.id} scope="col" className="border-l border-line p-3 font-normal">
                      <img src={p.thumbnail} alt="" width={160} height={160} loading="lazy" className="mx-auto aspect-square w-32 rounded-lg bg-surface-2 object-contain"/>
                      <Link to={productUrl(p)} className="mt-3 block rounded font-semibold hover:text-accent focus-ring">
                        {p.title}
                      </Link>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => addToCart(p)} disabled={p.stock <= 0}>
                          {p.stock <= 0 ? "Out of stock" : "Add to cart"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => remove(p.id)} aria-label={`Remove ${p.title} from compare`}>
                          Remove
                        </Button>
                      </div>
                    </th>))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (<tr key={row.label} className="border-t border-line align-top">
                    <th scope="row" className="p-3 font-medium text-muted">
                      {row.label}
                    </th>
                    {items.map((p) => (<td key={p.id} className={`border-l border-line p-3 ${items.length > 1 && row.best?.(p, items) === true ? BEST : ""}`}>
                        {row.render(p)}
                      </td>))}
                  </tr>))}
              </tbody>
            </table>
          </div>
        </>)}
    </div>);
}
