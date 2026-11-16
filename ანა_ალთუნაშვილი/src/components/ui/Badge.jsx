const tones = {
    success: 'bg-ok-soft text-ok',
    warning: 'bg-warn-soft text-warn',
    danger: 'bg-danger-soft text-danger',
    neutral: 'bg-sunken text-muted',
    info: 'bg-brand-soft text-brand',
};
export default function Badge({ tone = 'neutral', children }) {
    return (<span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>);
}
