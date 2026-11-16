import React from 'react';
export function Button({ children, type = 'button', onClick, fullWidth = false, disabled = false, className = '', }) {
    return (<button type={type} onClick={onClick} disabled={disabled} className={`py-3 px-6 bg-linear-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold rounded-xl transition shadow-lg shadow-pink-600/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${fullWidth ? 'w-full' : ''} ${className}`}>
        {children}
        </button>);
}
export default Button;
