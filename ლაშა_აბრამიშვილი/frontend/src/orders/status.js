export const actualOrderStatusLabels = { PENDING_PAYMENT: 'Pending payment · unpaid' };
export const DEMO_STAGES = ['Processing', 'Shipped', 'Delivered'];
export function getDemoOrderStatus(createdAt, now) {
    const placedAt = Date.parse(createdAt);
    if (!Number.isFinite(placedAt) || !Number.isFinite(now) || placedAt > now)
        return null;
    const elapsed = now - placedAt;
    if (elapsed < 60_000)
        return 'Processing';
    if (elapsed <= 180_000)
        return 'Shipped';
    return 'Delivered';
}
