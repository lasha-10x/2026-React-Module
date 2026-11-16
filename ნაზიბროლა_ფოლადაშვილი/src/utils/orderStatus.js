export function getOrderStatus(createdAt, currentTime) {
    const elapsedTime = currentTime - new Date(createdAt).getTime();
    if (elapsedTime < 60_000) {
        return "Processing";
    }
    if (elapsedTime < 180_000) {
        return "Shipped";
    }
    return "Delivered";
}
