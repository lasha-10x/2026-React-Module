import ButtonLink from "@/components/ui/ButtonLink";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
export default function NotFoundPage() {
    useDocumentTitle("Page not found");
    return (<div className="card mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-14 text-center">
      <p className="text-5xl font-extrabold text-brand dark:text-accent">404</p>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-muted">The page you are looking for does not exist.</p>
      <ButtonLink to="/">Go to catalog</ButtonLink>
    </div>);
}
