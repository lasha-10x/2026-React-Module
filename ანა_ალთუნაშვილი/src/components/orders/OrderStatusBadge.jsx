import Badge from '../ui/Badge';
const tones = {
    Processing: 'neutral',
    Shipped: 'info',
    Delivered: 'success',
};
export default function OrderStatusBadge({ status }) {
    return <Badge tone={tones[status]}>{status}</Badge>;
}
