// "Mariam Sepiashvili" -> "Mariam"; the account keeps one name field
export function getFirstName(fullName) {
    return fullName.trim().split(/\s+/)[0];
}
