import { i18n } from "i18next"

// Helper para validar o formato do username
export function usernameRegex(
    username: string,
    t: i18n["t"],
): { valid: boolean; message?: string } {
    if (username.length < 4 || username.length > 20) {
        return { valid: false, message: t("Your username must contain 4 to 20 characters.") }
    }
    if (username.startsWith(".") || username.endsWith(".")) {
        return { valid: false, message: t("Username cannot start or end with a dot.") }
    }
    if (/\.{2,}/.test(username) || /_{2,}/.test(username)) {
        return {
            valid: false,
            message: t("Username can use only single '.' or '_' without repeating."),
        }
    }
    return { valid: true }
}
