// კატალოგის პროდუქტებს API-დან იტვირთავს და მოთხოვნის გაუქმებას მართავს.
import { useEffect, useState } from "react";
import { fetchProducts } from "../../api/products";
import { CATALOG_PAGE_SIZE } from "../../types/catalog";
export function useCatalogProducts({ q, category, sort, page, setSearchParams, }) {
    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    useEffect(() => {
        // ფილტრების ცვლილება ახალ მოთხოვნას იწყებს და წინა მოთხოვნის გაუქმებასაც აწყობს.
        const controller = new AbortController();
        const params = { q, category, sort, page };
        const loadProducts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetchProducts(params, controller.signal);
                if (!controller.signal.aborted) {
                    const lastPage = Math.max(1, Math.ceil(response.total / CATALOG_PAGE_SIZE));
                    if (page > lastPage) {
                        setSearchParams((current) => {
                            if (lastPage === 1) {
                                current.delete("page");
                            }
                            else {
                                current.set("page", String(lastPage));
                            }
                            return current;
                        }, { replace: true });
                        return;
                    }
                    setProducts(response.products);
                    setTotal(response.total);
                }
            }
            catch (reason) {
                if (!controller.signal.aborted) {
                    setError(reason instanceof Error
                        ? reason.message
                        : "Something went wrong while loading products.");
                }
            }
            finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };
        void loadProducts();
        return () => controller.abort();
    }, [category, page, q, retryCount, setSearchParams, sort]);
    return {
        products,
        total,
        isLoading,
        error,
        retry: () => setRetryCount((count) => count + 1),
    };
}
