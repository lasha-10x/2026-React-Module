// CategoryFilter component to display a list of categories and allow users to filter products by category
function CategoryFilter({ categories, category, error, onCategoryChange, }) {
    // Function to determine the CSS classes for the category buttons based on whether they are selected or not
    // Use dark teal for the selected category and soft white for other categories
    // Match selected and unselected categories to both themes
    function buttonClass(isSelected) {
        return `min-h-11 shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:focus-visible:outline-teal-400 ${isSelected
            ? "border-teal-700 bg-teal-700 text-white shadow-sm dark:border-teal-300 dark:bg-teal-300 dark:text-teal-950"
            : "border-teal-200 bg-white/70 text-teal-800 hover:border-teal-300 hover:bg-teal-100 dark:border-teal-800 dark:bg-[#14332e] dark:text-teal-100 dark:hover:border-teal-600 dark:hover:bg-teal-900"}`;
    }
    return (<div className="min-w-0 w-full">
      <p id="category-label" className="mb-2 text-sm font-medium">
        Categories
      </p>

      <div role="group" aria-labelledby="category-label" className="flex w-full min-w-0 gap-2 overflow-x-auto px-1 py-2">
        <button type="button" onClick={() => onCategoryChange("")} aria-pressed={category === ""} className={buttonClass(category === "")}>
          All
        </button>

        {categories.map((item) => (<button key={item.slug} type="button" onClick={() => onCategoryChange(item.slug)} aria-pressed={category === item.slug} className={buttonClass(category === item.slug)}>
            {item.name}
          </button>))}
      </div>

      {error && (<p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>)}
    </div>);
}
export default CategoryFilter;
