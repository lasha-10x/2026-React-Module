import { StorageService } from "./StorageService";
import { isRecord } from "../api/client";
import { STORAGE_KEYS } from "./storageKeys";
export const emptyProfile = { firstName: "", lastName: "", email: "", phone: "" };
function isProfileData(value) {
    return (isRecord(value) &&
        ["firstName", "lastName", "email", "phone"].every((key) => typeof value[key] === "string") &&
        ["memberSince", "updatedAt"].every((key) => value[key] === undefined || typeof value[key] === "string"));
}
function isProfilesByUser(value) {
    return isRecord(value) && Object.values(value).every(isProfileData);
}
// One profile per username, so a second shopper in the same browser never sees
// (or overwrites) the first shopper's name, contact details or address.
const profilesStorage = new StorageService(STORAGE_KEYS.profiles, isProfilesByUser, {});
// Before profiles were per user, one shared profile was kept under `shop_profile`.
const legacyProfileStorage = new StorageService(STORAGE_KEYS.profile, (value) => value === null || isProfileData(value), null);
/**
 * Moves the old shared profile to `username` (the shopper who was signed in when it
 * was saved) once, then deletes it so it can never be shown to anyone else.
 */
export function migrateLegacyProfile(username) {
    const legacy = legacyProfileStorage.load();
    if (!legacy)
        return;
    if (username) {
        const profiles = profilesStorage.load();
        if (!profiles[username])
            profilesStorage.save({ ...profiles, [username]: legacy });
    }
    legacyProfileStorage.clear();
}
export function loadProfile(username) {
    return profilesStorage.load()[username] ?? emptyProfile;
}
export function saveProfile(username, profile) {
    profilesStorage.save({ ...profilesStorage.load(), [username]: profile });
}
