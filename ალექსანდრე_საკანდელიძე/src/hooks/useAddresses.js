/**
 * NOTE: the delivery addresses saved in this browser (BONUS).
 * Why it exists: Checkout adds them and offers them, and Profile lists and removes them, so that logic is written once.
 * Connects to: `useLocalStorage` saves them under `shop_addresses`. "Clear local data" on Profile empties them.
 */
import { useCallback } from "react";
import { STORAGE_KEYS } from "@/utils/constants";
import { addressKey, parseAddresses } from "@/utils/guards";
import { useLocalStorage } from "./useLocalStorage";
export { addressKey };
/** How an address reads on one line. */
export function formatAddress({ address, city, postalCode, country }) {
    return `${address}, ${city} ${postalCode}, ${country}`;
}
/** Reads the saved addresses and changes them. */
export function useAddresses() {
    const [addresses, save, clearAddresses] = useLocalStorage(STORAGE_KEYS.addresses, [], parseAddresses);
    const removeAddress = useCallback((address) => save(addresses.filter((saved) => addressKey(saved) !== addressKey(address))), [addresses, save]);
    const addAddress = useCallback((address) => save([address, ...addresses.filter((saved) => addressKey(saved) !== addressKey(address))]), [addresses, save]);
    return { addresses, addAddress, removeAddress, clearAddresses };
}
