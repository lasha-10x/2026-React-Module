import { buttonClasses } from "./buttonStyles";
export default function Button({ variant = "primary", size = "md", className = "", type = "button", ...rest }) {
    return <button type={type} className={buttonClasses(variant, size, className)} {...rest}/>;
}
