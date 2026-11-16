const styles = {
    Processing: "bg-surface-2 text-muted",
    Shipped: "bg-brand/15 text-accent",
    Delivered: "bg-success/15 text-success",
};
export default function OrderStatusBadge({ status }) {
    return <span className={`rounded-full px-3 py-1 text-xs font-bold ${styles[status]}`}>{status}</span>;
}
