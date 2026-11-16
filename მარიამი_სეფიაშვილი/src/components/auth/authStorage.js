import { isArrayOf, isAuthUser, isStoredUser } from "../../utils/guards";
import { StorageService } from "../../models/StorageService";
import { STORAGE_KEYS } from "../../utils/storageKeys";
// an account problem tied to one form field, so the form can show it next to that field
export class AccountError extends Error {
    field;
    constructor(field, message) {
        super(message);
        this.name = "AccountError";
        this.field = field;
    }
}
function isStoredUserList(value) {
    return isArrayOf(value, isStoredUser);
}
const usersStorage = new StorageService(STORAGE_KEYS.users, isStoredUserList);
export const currentUserStorage = new StorageService(STORAGE_KEYS.currentUser, isAuthUser);
function readUsers() {
    return usersStorage.get() ?? [];
}
function saveUsers(users) {
    usersStorage.set(users);
}
function toAuthUser({ username, name, email, phone }) {
    return { username, name, email, phone };
}
export function registerUser(user) {
    const users = readUsers();
    if (users.some((u) => u.username === user.username)) {
        throw new AccountError("username", "This username is already taken");
    }
    if (users.some((u) => u.email === user.email)) {
        throw new AccountError("email", "An account with this email already exists");
    }
    saveUsers([...users, user]);
    return toAuthUser(user);
}
export function loginUser(username, password) {
    const user = readUsers().find((u) => u.username === username && u.password === password);
    if (!user) {
        throw new Error("Wrong username or password");
    }
    return toAuthUser(user);
}
export function loadCurrentUser() {
    return currentUserStorage.get();
}
export function updateUser(username, changes) {
    const users = readUsers();
    if (users.some((u) => u.username !== username && u.email === changes.email)) {
        throw new AccountError("email", "An account with this email already exists");
    }
    saveUsers(users.map((u) => u.username === username ? { ...u, ...changes } : u));
    return { username, ...changes };
}
// local demo reset: the username and email together stand in for a recovery email
export function resetPassword(username, email, newPassword) {
    const users = readUsers();
    if (!users.some((u) => u.username === username && u.email === email)) {
        throw new AccountError("username", "No account matches this username and email");
    }
    saveUsers(users.map((u) => u.username === username ? { ...u, password: newPassword } : u));
}
