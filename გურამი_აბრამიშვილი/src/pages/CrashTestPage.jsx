// Error Boundary demo route (/crash-test): rendering this component always throws.
// The Layout's ErrorBoundary must catch it and show the "Something went wrong." fallback.
export default function CrashTestPage() {
    throw new Error("Intentional crash to demonstrate the Error Boundary");
}
