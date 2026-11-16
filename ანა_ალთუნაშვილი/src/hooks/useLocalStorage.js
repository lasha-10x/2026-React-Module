import { useEffect, useState } from 'react';
/** useState that remembers its value in localStorage (through a validated StorageService). */
export function useLocalStorage(storage, initialValue) {
    const [value, setValue] = useState(() => storage.get() ?? initialValue);
    useEffect(() => {
        storage.set(value);
    }, [storage, value]);
    return [value, setValue];
}
