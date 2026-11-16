// პროფილის მისამართებს, დაბრუნების მოთხოვნებს, ბარათებსა და შეკვეთებს მართავს.
import { useRef, useState } from "react";
import { readOrders } from "../../utils/orders";
const emptyAddress = {
    country: "",
    city: "",
    street: "",
    postalCode: "",
};
const emptyRefund = {
    bankName: "",
    accountHolder: "",
    iban: "",
};
const emptyCard = {
    holder: "",
    number: "",
    expiry: "",
};
function readSaved(key, isValid) {
    // მომხმარებლის პროფილის სიებს localStorage-დან ვკითხულობთ, დაზიანებულ JSON-ზე კი ცარიელს ვაბრუნებთ.
    try {
        const value = JSON.parse(localStorage.getItem(key) ?? "[]");
        return Array.isArray(value) ? value.filter(isValid) : [];
    }
    catch {
        return [];
    }
}
function isProfileAddress(value) {
    if (typeof value !== "object" || value === null)
        return false;
    return "id" in value && typeof value.id === "string" &&
        "country" in value && typeof value.country === "string" &&
        "city" in value && typeof value.city === "string" &&
        "street" in value && typeof value.street === "string" &&
        "postalCode" in value && typeof value.postalCode === "string";
}
function isRefundRequest(value) {
    if (typeof value !== "object" || value === null)
        return false;
    return "id" in value && typeof value.id === "string" &&
        "bankName" in value && typeof value.bankName === "string" &&
        "accountHolder" in value && typeof value.accountHolder === "string" &&
        "iban" in value && typeof value.iban === "string" &&
        "submittedAt" in value && typeof value.submittedAt === "string" &&
        "status" in value && value.status === "Submitted";
}
function isSavedCard(value) {
    if (typeof value !== "object" || value === null)
        return false;
    return "id" in value && typeof value.id === "string" &&
        "holder" in value && typeof value.holder === "string" &&
        "lastFour" in value && typeof value.lastFour === "string" && /^\d{4}$/.test(value.lastFour) &&
        "expiry" in value && typeof value.expiry === "string";
}
function persistList(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    }
    catch {
        return false;
    }
}
export function useProfileManagement({ user, updateProfile }) {
    // მომხმარებლის მიხედვით ცალკე გასაღები ინახავს მისამართებს, ბარათებსა და მოთხოვნებს.
    const storagePrefixRef = useRef(`middle-market-${user.username || user.email}`);
    const storagePrefix = storagePrefixRef.current;
    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);
    const [email, setEmail] = useState(user.email);
    const [phone, setPhone] = useState(user.phone);
    const [identityErrors, setIdentityErrors] = useState({});
    const [addresses, setAddresses] = useState(() => readSaved(`${storagePrefix}-addresses`, isProfileAddress));
    const [refundRequests, setRefundRequests] = useState(() => readSaved(`${storagePrefix}-refunds`, isRefundRequest));
    const [cards, setCards] = useState(() => readSaved(`${storagePrefix}-cards`, isSavedCard));
    const [orders] = useState(() => readOrders().filter((order) => order.username === user.username));
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [addressForm, setAddressForm] = useState(emptyAddress);
    const [refundForm, setRefundForm] = useState(emptyRefund);
    const [cardForm, setCardForm] = useState(emptyCard);
    const [notice, setNotice] = useState("");
    const changeIdentityField = (field, value) => {
        const setters = {
            firstName: setFirstName,
            lastName: setLastName,
            email: setEmail,
            phone: setPhone,
        };
        setters[field](value);
        setIdentityErrors((current) => ({ ...current, [field]: undefined }));
    };
    const saveAddresses = (next) => {
        setAddresses(next);
        return persistList(`${storagePrefix}-addresses`, next);
    };
    const saveRefundRequests = (next) => {
        setRefundRequests(next);
        return persistList(`${storagePrefix}-refunds`, next);
    };
    const saveCards = (next) => {
        setCards(next);
        return persistList(`${storagePrefix}-cards`, next);
    };
    const saveProfile = () => {
        // სახელის თითოეულ ნაწილსა და ტელეფონს შენახვამდე ცალკე ვამოწმებთ.
        const nextErrors = {};
        if (firstName.trim().length < 2)
            nextErrors.firstName = "First name must be at least 2 characters.";
        if (lastName.trim().length < 2)
            nextErrors.lastName = "Last name must be at least 2 characters.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
            nextErrors.email = "Enter a valid email address.";
        if (!phone.trim())
            nextErrors.phone = "Phone number is required.";
        setIdentityErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) {
            setNotice("Please correct the highlighted fields before saving.");
            return;
        }
        const normalizedFirstName = firstName.trim();
        const normalizedLastName = lastName.trim();
        // AuthContext-ის განახლება Header-საც აჩვენებს ახალ სრულ სახელსა და ელფოსტას.
        updateProfile({
            firstName: normalizedFirstName,
            lastName: normalizedLastName,
            fullName: `${normalizedFirstName} ${normalizedLastName}`,
            email: email.trim(),
            address: user.address,
            phone: phone.trim(),
        });
        setNotice("Your profile has been saved.");
    };
    const updateAddressField = (field, value) => {
        setAddressForm((current) => ({ ...current, [field]: value }));
    };
    const saveAddress = () => {
        // რედაქტირებისას არსებულ ჩანაწერს ვცვლით, სხვა შემთხვევაში ახალ ID-ს ვქმნით.
        const wasEditing = editingAddressId !== null;
        const next = wasEditing
            ? addresses.map((address) => address.id === editingAddressId ? { ...address, ...addressForm } : address)
            : [...addresses, { id: `address-${Date.now()}`, ...addressForm }];
        const saved = saveAddresses(next);
        setAddressForm(emptyAddress);
        setEditingAddressId(null);
        setNotice(saved ? (wasEditing ? "Address updated." : "Address added.") : "Address changed for this session but could not be saved.");
    };
    const editAddress = (address) => {
        setEditingAddressId(address.id);
        setAddressForm({
            country: address.country,
            city: address.city,
            street: address.street,
            postalCode: address.postalCode,
        });
        setNotice("");
    };
    const removeAddress = (id) => {
        const saved = saveAddresses(addresses.filter((address) => address.id !== id));
        setNotice(saved ? "Address removed." : "Address removed for this session but could not be saved.");
    };
    const cancelAddressEdit = () => {
        setEditingAddressId(null);
        setAddressForm(emptyAddress);
    };
    const updateRefundField = (field, value) => {
        setRefundForm((current) => ({ ...current, [field]: value }));
    };
    const submitRefundRequest = () => {
        const request = {
            id: `refund-${Date.now()}`,
            ...refundForm,
            submittedAt: new Date().toISOString(),
            status: "Submitted",
        };
        const saved = saveRefundRequests([request, ...refundRequests]);
        setRefundForm(emptyRefund);
        setNotice(saved ? "Refund request submitted." : "Request submitted for this session but could not be saved.");
    };
    const updateCardField = (field, value) => {
        setCardForm((current) => ({ ...current, [field]: value }));
    };
    const saveCard = () => {
        // ვალიდაციის შემდეგ სრულ ნომერს არ ვინახავთ; მხოლოდ ბოლო ოთხ ციფრს ვტოვებთ.
        const digits = cardForm.number.replace(/\D/g, "");
        if (digits.length < 12 || digits.length > 19) {
            setNotice("Enter a valid card number (12–19 digits).");
            return;
        }
        const card = {
            id: `card-${Date.now()}`,
            holder: cardForm.holder.trim(),
            lastFour: digits.slice(-4),
            expiry: cardForm.expiry,
        };
        const saved = saveCards([card, ...cards]);
        setCardForm(emptyCard);
        setNotice(saved ? "Masked card reference saved." : "Card reference saved for this session but could not be saved.");
    };
    const removeCard = (id) => {
        const saved = saveCards(cards.filter((card) => card.id !== id));
        setNotice(saved ? "Card reference removed." : "Card removed for this session but could not be saved.");
    };
    return {
        firstName,
        setFirstName: (value) => changeIdentityField("firstName", value),
        lastName,
        setLastName: (value) => changeIdentityField("lastName", value),
        email,
        setEmail: (value) => changeIdentityField("email", value),
        phone,
        setPhone: (value) => changeIdentityField("phone", value),
        identityErrors,
        saveProfile,
        addresses,
        addressForm,
        editingAddressId,
        updateAddressField,
        saveAddress,
        editAddress,
        removeAddress,
        cancelAddressEdit,
        orders,
        refundRequests,
        refundForm,
        updateRefundField,
        submitRefundRequest,
        cards,
        cardForm,
        updateCardField,
        saveCard,
        removeCard,
        notice,
        setNotice,
        clearNotice: () => setNotice(""),
    };
}
