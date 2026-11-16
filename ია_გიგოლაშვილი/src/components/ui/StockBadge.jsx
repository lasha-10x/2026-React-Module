import { getStockStatus } from "../../utils/stock";
const TONES = {
    ok: "text-success",
    low: "text-warning",
    out: "text-danger",
};
export function StockBadge({ stock }) {
    const status = getStockStatus(stock);
    return (<span className={`inline-flex items-center gap-1.5 text-xs font-medium ${TONES[status.tone]}`}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true"/>
      {status.label}
    </span>);
}
