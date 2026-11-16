import { STATUS_COLORS } from "./orderStatus";
export default function StatusPill({ status }) {
    return (<span className={`px-4 py-1.5 rounded-full text-sm font-extrabold -rotate-3 ${STATUS_COLORS[status]}`}>
    {status}
   </span>);
}
