import { useCallback, useEffect, useMemo, useState } from "react";
import { StorageService } from "@/models/StorageService";
// useState that survives page reloads. `guard` validates whatever was stored.
export function useLocalStorage(key, initial, guard) {
    const storage = useMemo(() => new StorageService(key, guard), [key, guard]);
    const [value, setValue] = useState(() => storage.get() ?? initial);
    useEffect(() => {
        storage.set(value);
    }, [storage, value]);
    const update = useCallback((next) => setValue(next), []);
    return [value, update];
}
