import { object, string } from "yup";
export const checkoutSchema = object({
    fullName: string().trim().required("Full name is required").min(3, "Full name must be at least 3 characters"),
    email: string().trim().required("Email is required").email("Please enter a valid email address"),
    address: string().trim().required("Address is required").min(5, "Address must be at least 5 characters"),
    city: string().trim().required("City is required"),
});
