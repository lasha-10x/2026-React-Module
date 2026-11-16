import { useEffect, useState } from "react";
import getProducts, { getCategories } from "../api/products";
import ProductGrid from "../components/product/ProductGrid.jsx";
import { useSearchParams } from "react-router";
import Pagination from "../components/Pagination.jsx";
import CategoryFilter from "../components/product/CategoryFilter.jsx";
import CatalogToolbar from "../components/product/CatalogToolbar.jsx";
function Catalog() {
    // State to hold the products, loading status, and error message
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState("");
    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState("");
    const [categoryError, setCategoryError] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const [total, setTotal] = useState(0);
    const pageValue = Number(searchParams.get("page") ?? "1");
    const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
    const limit = 12;
    const pageCount = Math.ceil(total / limit);
    // useEffect to fetch products when the component mounts
    useEffect(() => {
        let ignore = false;
        // Function to load products from the API
        async function loadProducts() {
            // Set loading to true and clear any previous error
            setLoading(true);
            setError(null);
            try {
                // Fetch products from the API using the getProducts function
                const data = await getProducts(query, sort, page, category);
                if (!ignore) {
                    setProducts(data.products);
                    setTotal(data.total);
                }
            }
            catch (error) { // Catch any errors that occur during the fetch
                if (!ignore) {
                    setError(error instanceof Error
                        ? error.message
                        : "Something went wrong");
                }
            }
            finally { // Finally block to set loading to false after the fetch is complete
                if (!ignore) {
                    setLoading(false);
                }
            }
        }
        loadProducts();
        return () => {
            ignore = true;
        };
    }, [query, sort, page, category]); // Dependency array to re-run the effect when query or sort changes
    // useEffect to fetch categories when the component mounts
    useEffect(() => {
        let ignore = false;
        // Function to load categories from the API
        async function loadCategories() {
            try {
                const data = await getCategories();
                if (!ignore) {
                    setCategories(data);
                }
            }
            catch {
                if (!ignore) {
                    setCategoryError("Could not load categories.");
                }
            }
        }
        loadCategories();
        return () => {
            ignore = true;
        };
    }, []);
    // Function to select a category and reset the search query and page number
    function selectCategory(value) {
        setCategory(value);
        setQuery("");
        resetPage();
    }
    // Function to change the page when the user navigates through pagination
    function changePage(nextPage) {
        if (nextPage < 1 || nextPage > pageCount)
            return;
        const params = new URLSearchParams(searchParams);
        params.set("page", String(nextPage));
        setSearchParams(params);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
    // Function to reset the page number to 1 when the search query or sort option changes
    function resetPage() {
        const params = new URLSearchParams(searchParams);
        params.set("page", "1");
        setSearchParams(params, { replace: true });
    }
    // Function to handle changes in the search query and reset the category and page number
    function handleQueryChange(value) {
        setQuery(value);
        setCategory("");
        resetPage();
    }
    // Function to handle changes in the sort option and reset the page number
    function handleSortChange(value) {
        setSort(value);
        resetPage();
    }
    return (<section className="mx-auto w-full min-w-0 max-w-7xl px-10 py-10 sm:px-12 lg:px-14">
            <h1 className="mb-6 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Catalog
            </h1>
            <div className="mb-8 min-w-0 space-y-4">
                <CatalogToolbar query={query} sort={sort} onQueryChange={handleQueryChange} onSortChange={handleSortChange}/>

                <CategoryFilter categories={categories} category={category} error={categoryError} onCategoryChange={selectCategory}/>
            </div>
            {/* Show feedback while products are being fetched */}
            {loading && (<div role="status" className="flex items-center justify-center gap-3 py-6 text-teal-700">
                    <span aria-hidden="true" className="h-5 w-5 rounded-full border-2 border-teal-200 border-t-teal-700 motion-safe:animate-spin"/>
                    <span>Loading products...</span>
                </div>)}
            {error ? ( // Display an error message if there is an error
        <p role="alert" className="text-red-600">
                    {error}
                </p>) : products.length > 0 ? ( // Display the ProductGrid component if there are products to show
        <ProductGrid products={products}/>) : !loading ? ( // Display a message if there are no products found and loading is complete
        <p>No products found.</p>) : null}
            {!error && (<Pagination page={page} pageCount={pageCount} loading={loading} onPageChange={changePage}/>)}
        </section>);
}
export default Catalog;
