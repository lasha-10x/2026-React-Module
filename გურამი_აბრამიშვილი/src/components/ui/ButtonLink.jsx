import { Link } from "react-router-dom";
import { buttonClasses } from "./buttonStyles";
export default function ButtonLink({ variant = "primary", size = "md", className = "", ...rest }) {
    return <Link className={buttonClasses(variant, size, className)} {...rest}/>;
}
