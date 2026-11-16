/**
 * `primary` is pink, which means "act". It sits on a hard shadow and drops 3px when pressed, like a
 * physical machine button. `quiet` is for everything that shouldn't compete with it.
 */
export const buttonStyles = {
    primary: "inline-flex min-h-11 items-center justify-center rounded-md bg-pink px-[18px] font-bold text-on-pink no-underline shadow-[0_3px_0_var(--color-pink-deep),inset_0_1px_0_rgb(255_255_255/0.35)] transition-[translate,box-shadow,filter] duration-100 hover:brightness-110 active:translate-y-[3px] active:shadow-[inset_0_1px_0_rgb(255_255_255/0.35)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-steel-raised disabled:text-ink-soft disabled:shadow-[inset_0_0_0_1px_var(--edge)] disabled:brightness-100",
    quiet: "inline-flex min-h-11 items-center justify-center rounded-md bg-steel-raised px-3.5 font-semibold text-ink no-underline shadow-[inset_0_0_0_1px_var(--edge-bright)] transition-colors duration-150 hover:bg-edge disabled:cursor-not-allowed disabled:text-ink-soft",
};
/**
 * A <button> with our styling. `...rest` passes on everything else (onClick, disabled, type).
 * `type` defaults to "button" because inside a form a plain <button> would submit it by accident.
 */
export default function Button({ variant = "primary", className = "", type = "button", ...rest }) {
    return <button type={type} className={`${buttonStyles[variant]} ${className}`} {...rest}/>;
}
