import { useCallback, useEffect, useMemo, useState } from 'react';
import { StorageService } from '../models/StorageService';
export function useLocalStorage(key, initialValue, isValue) {
    const storage = useMemo(() => new StorageService(key, isValue), [key, isValue]);
    const [value, setValue] = useState(() => {
        return storage.get() ?? initialValue;
    });
    useEffect(() => {
        storage.set(value);
    }, [storage, value]);
    const updateValue = useCallback((nextValue) => {
        setValue(nextValue);
    }, []);
    return [value, updateValue];
}
