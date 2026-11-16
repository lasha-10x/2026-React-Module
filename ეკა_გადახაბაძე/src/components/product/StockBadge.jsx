import { getStockLabel, getStockLevel } from '../../utils/stock';
const LEVEL_CLASSES = {
    'in-stock': 'text-sage',
    low: 'text-orange-600',
    out: 'text-red-700',
};
export default function StockBadge({ stock }) {
    return <span className={`text-sm font-semibold ${LEVEL_CLASSES[getStockLevel(stock)]}`}>{getStockLabel(stock)}</span>;
}
