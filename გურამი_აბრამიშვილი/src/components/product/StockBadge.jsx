import { LOW_STOCK_LIMIT } from "@/utils/constants";
export default function StockBadge({ stock }) {
    if (stock <= 0) {
        return <span className="inline-block rounded-md bg-danger/15 px-2 py-0.5 text-xs font-semibold text-danger">Out of stock</span>;
    }
    if (stock <= LOW_STOCK_LIMIT) {
        return <span className="inline-block rounded-md bg-warn/15 px-2 py-0.5 text-xs font-semibold text-warn">Only {stock} left!</span>;
    }
    return <span className="inline-block rounded-md bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">In stock</span>;
}
