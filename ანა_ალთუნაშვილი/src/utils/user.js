/** The name shown in the header and on reviews. */
export function getDisplayName(user) {
    return user.firstName?.trim() || user.username;
}
/** "Anna Smith" when both names exist, otherwise whatever is available. */
export function getFullName(user) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ');
}
