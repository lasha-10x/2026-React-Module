import * as Yup from "yup";
// Yup Validation Schema used by Formik on the Login page (FULL).
export const loginSchema = Yup.object({
    username: Yup.string().trim().required("Username is required"),
    password: Yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
});
