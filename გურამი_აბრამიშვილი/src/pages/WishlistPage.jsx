import ProductGrid from "@/components/product/ProductGrid";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import PageHeading from "@/components/ui/PageHeading";
import { EmptyState } from "@/components/ui/StatusMessage";
import { useToast } from "@/context/ToastContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAddToCart } from "@/hooks/useAddToCart";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { pluralize } from "@/utils/format";
// BONUS page: products saved with the heart button.
export default function WishlistPage() {
    useDocumentTitle("Wishlist");
    const { items, clear } = useWishlist();
    const { toast } = useToast();
    const addToCart = useAddToCart();
    return (<div>
      <PageHeading title="Wishlist" subtitle={items.length === 0 ? undefined : pluralize(items.length, "saved product")}>
        {items.length > 0 && (<Button variant="secondary" size="sm" onClick={() => {
                clear();
                toast("Wishlist cleared");
            }}>
            Clear wishlist
          </Button>)}
      </PageHeading>

      {items.length === 0 ? (<EmptyState title="Your wishlist is empty.">
          <ButtonLink to="/">Browse products</ButtonLink>
        </EmptyState>) : (<ProductGrid products={items} onAdd={(p) => addToCart(p)}/>)}
    </div>);
}
