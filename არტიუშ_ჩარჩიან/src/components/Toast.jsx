import React from 'react';
export function Toast({ message, onClose }) { return <div className="toast" role="status" onClick={onClose}>{message}</div>; }
