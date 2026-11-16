import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import Spinner from "@/components/ui/Spinner";
import Footer from "./Footer";
import Header from "./Header";
import ScrollToTop from "./ScrollToTop";
// One Layout route: Header + <Outlet /> + Footer are written once for every page.
export default function Layout() {
    const { pathname } = useLocation();
    return (<div className="flex min-h-dvh flex-col">
      <ScrollToTop />
      <a href="#main" className="sr-only z-50 rounded-lg bg-brand px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="container-page flex-1 py-6 outline-none sm:py-10">
        {/* key = pathname: navigating away from a crashed page resets the boundary */}
        <ErrorBoundary key={pathname}>
          <Suspense fallback={<Spinner />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>);
}
