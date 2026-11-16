import { SORT_OPTIONS } from "./constants";
export function isSortOption(value) {
    return SORT_OPTIONS.some((option) => option.value === value);
}
export function parseCatalogParams(sp) {
    const q = sp.get("q")?.trim() ?? "";
    const category = q === "" ? (sp.get("category") ?? "") : "";
    const sortRaw = sp.get("sort") ?? "";
    const pageRaw = Number(sp.get("page"));
    return {
        q,
        category,
        sort: isSortOption(sortRaw) ? sortRaw : "",
        page: Number.isInteger(pageRaw) && pageRaw >= 1 ? pageRaw : 1,
    };
}
export function parseViewMode(sp) {
    return sp.get("view") === "list" ? "list" : "grid";
}
