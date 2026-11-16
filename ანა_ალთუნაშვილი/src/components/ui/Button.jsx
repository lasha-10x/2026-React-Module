import { buttonStyles } from './buttonStyles';
export default function Button({ variant = 'primary', size = 'md', type = 'button', className = '', ...rest }) {
    return <button type={type} className={`${buttonStyles(variant, size)} ${className}`} {...rest}/>;
}
