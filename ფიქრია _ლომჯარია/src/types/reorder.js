function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isCount(value) {
    return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}
function isItemResult(value) {
    if (!isRecord(value) || !isCount(value.productId) || value.productId < 1 ||
        typeof value.title !== 'string' || !value.title.trim() ||
        !isCount(value.requestedQuantity) || value.requestedQuantity < 1 ||
        !isCount(value.addedQuantity) || !isCount(value.skippedQuantity) ||
        value.addedQuantity + value.skippedQuantity !== value.requestedQuantity ||
        (value.reason !== undefined && typeof value.reason !== 'string'))
        return false;
    if (value.repricing !== undefined) {
        const change = value.repricing;
        if (!isRecord(change) || value.addedQuantity === 0 || !isCount(change.existingQuantity) || change.existingQuantity < 1 ||
            typeof change.previousUnitPrice !== 'number' || !Number.isFinite(change.previousUnitPrice) || change.previousUnitPrice < 0 ||
            typeof change.currentUnitPrice !== 'number' || !Number.isFinite(change.currentUnitPrice) || change.currentUnitPrice < 0)
            return false;
    }
    return true;
}
export function isReorderResult(value) {
    if (!isRecord(value) || !Array.isArray(value.items) || value.items.length === 0 || !value.items.every(isItemResult))
        return false;
    const hasAdded = value.items.some((item) => item.addedQuantity > 0);
    const hasSkipped = value.items.some((item) => item.skippedQuantity > 0);
    return value.outcome === (!hasAdded ? 'failure' : hasSkipped ? 'partial' : 'success');
}
