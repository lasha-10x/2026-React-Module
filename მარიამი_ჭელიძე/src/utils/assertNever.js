/** შეუმჩნეველ union ვარიანტს TypeScript-ის კომპილაციისას შეცდომად აქცევს. */
export function assertNever(value) {
    throw new Error(`Unhandled discriminated union value: ${String(value)}`);
}
