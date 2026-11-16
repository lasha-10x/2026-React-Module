import { useFormik } from "formik";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { loginSchema } from "@/utils/loginSchema";
import { getFromPath } from "@/utils/routing";
import Button from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
export default function LoginPage() {
    useDocumentTitle("Log in");
    const { isLoggedIn, login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = getFromPath(location.state); // "/checkout" when we were sent here from Checkout, otherwise "/"
    // Formik owns the form state; the Yup schema owns the rules.
    const formik = useFormik({
        initialValues: { username: "", password: "" },
        validationSchema: loginSchema,
        onSubmit: (values) => {
            login(values.username.trim()); // local simulation: sets the AuthContext state
            navigate(from, { replace: true });
        },
    });
    // Already signed in: nothing to do here.
    if (isLoggedIn && !formik.isSubmitting)
        return <Navigate to={from} replace/>;
    const usernameError = formik.touched.username || formik.submitCount > 0 ? formik.errors.username : undefined;
    const passwordError = formik.touched.password || formik.submitCount > 0 ? formik.errors.password : undefined;
    return (<div className="mx-auto max-w-md">
      <div className="card p-6 sm:p-8">
        <h1 className="text-2xl font-bold">Log in</h1>
        <p className="mt-1 text-sm text-muted">
          {from === "/checkout" ? "Please log in to continue to checkout." : "Welcome back to 10X Shop."}
        </p>

        <form onSubmit={formik.handleSubmit} noValidate className="mt-6 space-y-4">
          <TextField label="Username" name="username" autoComplete="username" value={formik.values.username} onChange={formik.handleChange} onBlur={formik.handleBlur} error={usernameError}/>
          <TextField label="Password" name="password" type="password" autoComplete="current-password" value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur} error={passwordError}/>
          <Button type="submit" className="w-full" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? "Logging in…" : "Log In"}
          </Button>
        </form>

        <p className="mt-4 rounded-lg bg-surface-2 p-3 text-xs text-muted">
          Demo mode: no real account is checked. Any username with a password of 6+ characters works (for example{" "}
          <code className="font-semibold">emilys</code> / <code className="font-semibold">emilyspass</code>).
        </p>

        <Link to="/" className="mt-4 inline-block rounded text-sm font-medium text-accent hover:underline focus-ring">
          ← Back to catalog
        </Link>
      </div>
    </div>);
}
