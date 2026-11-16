import { useMemo, useState } from "react";
// Generic controlled-form hook. Values live in useState, inputs are driven by value/onChange,
// the form submits through onSubmit + preventDefault, and errors show after blur or a submit attempt.
export function useForm(initialValues, validate) {
    const [values, setValues] = useState(initialValues);
    const [touched, setTouched] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const errors = useMemo(() => validate(values), [validate, values]);
    function handleChange(e) {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
    }
    function handleBlur(e) {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
    }
    function setFieldValue(name, value) {
        setValues((prev) => ({ ...prev, [name]: value }));
    }
    function fieldError(name) {
        return touched[name] === true || submitted ? errors[name] : undefined;
    }
    function handleSubmit(onValid) {
        return (e) => {
            e.preventDefault(); // no page reload
            setSubmitted(true);
            if (Object.keys(errors).length === 0)
                onValid(values);
        };
    }
    function reset(next = initialValues) {
        setValues(next);
        setTouched({});
        setSubmitted(false);
    }
    return { values, errors, fieldError, handleChange, handleBlur, handleSubmit, setFieldValue, reset };
}
