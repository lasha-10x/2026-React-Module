import { useState } from 'react';
import { validateCheckout } from '../../utils/validation';
import TextField from '../ui/TextField';
const EMPTY_VALUES = { fullName: '', email: '', address: '', city: '' };
export default function CheckoutForm({ isPlacing, onPlaceOrder }) {
    const [values, setValues] = useState(EMPTY_VALUES);
    const [errors, setErrors] = useState({});
    const updateField = (field, value) => {
        setValues((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
    };
    const handleSubmit = (event) => {
        event.preventDefault();
        if (isPlacing)
            return;
        const nextErrors = validateCheckout(values);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length === 0) {
            onPlaceOrder({
                fullName: values.fullName.trim(),
                email: values.email.trim(),
                address: values.address.trim(),
                city: values.city.trim(),
            });
        }
    };
    return (<form noValidate onSubmit={handleSubmit} className="space-y-6">
      <TextField id="fullName" label="Full name" value={values.fullName} autoComplete="name" required error={errors.fullName} onChange={(value) => updateField('fullName', value)}/>
      <TextField id="email" label="Email" type="email" value={values.email} autoComplete="email" required error={errors.email} onChange={(value) => updateField('email', value)}/>
      <TextField id="address" label="Address" value={values.address} autoComplete="street-address" required error={errors.address} onChange={(value) => updateField('address', value)}/>
      <TextField id="city" label="City" value={values.city} autoComplete="address-level2" required error={errors.city} onChange={(value) => updateField('city', value)}/>
      <button type="submit" disabled={isPlacing} className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center bg-wine-700 px-6 font-sans text-xs font-bold tracking-widest text-cream uppercase transition-colors hover:bg-wine-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wine-700 disabled:cursor-wait disabled:bg-wine-950/40">
        {isPlacing ? 'Placing order…' : 'Place order'}
      </button>
    </form>);
}
