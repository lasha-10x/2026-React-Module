import { buttonClasses } from './buttonStyles';
export function Button({ variant = 'primary', size = 'md', fullWidth = false, className = '', type = 'button', ...rest }) {
    return (<button type={type} className={`${buttonClasses(variant, size, fullWidth)} ${className}`.trim()} {...rest}/>);
}
