export default function CategorySelector({ categories, value, onChange, disabled }) {
    return (<label className="block w-full max-w-md space-y-2">
      <span className="block font-medium">Category</span>
      <select value={value} onChange={(event) => onChange(event.currentTarget.value)} disabled={disabled} className="w-full rounded-md border border-neutral-400 bg-white px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:bg-neutral-100">
        <option value="">All Categories</option>
        {categories.map(({ slug, name }) => (<option key={slug} value={slug}>{name}</option>))}
      </select>
    </label>);
}
