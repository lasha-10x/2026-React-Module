const STATUS_STYLES = {
    Processing: "bg-gray-100 text-gray-700",
    Shipped: "bg-blue-100 text-blue-700",
    Delivered: "bg-emerald-100 text-emerald-700",
};
function OrderStatusBadge({ status }) {
    return (<span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}>
      {status}
    </span>);
}
export default OrderStatusBadge;
