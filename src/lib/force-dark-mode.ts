import { Appearance } from "react-native"

/**
 * Circle é um app dark-only: a aparência não deve seguir o modo do sistema.
 *
 * A garantia principal é nativa — `UIUserInterfaceStyle: Dark` no Info.plist (iOS)
 * e `expo_system_ui_user_interface_style = dark` no strings.xml (Android), ambos
 * derivados de `userInterfaceStyle: "dark"` no `app.config.js`.
 *
 * Este módulo é a trava do lado JS: força o override de aparência do React Native
 * (que no iOS aplica `overrideUserInterfaceStyle = .dark` em todas as janelas) para
 * que `useColorScheme()` e qualquer biblioteca que leia `Appearance` sempre vejam
 * "dark", mesmo que o aparelho esteja em modo claro.
 */
function applyDarkMode() {
    if (Appearance.getColorScheme() !== "dark") {
        Appearance.setColorScheme("dark")
    }
}

// Aplica imediatamente, antes de qualquer componente montar.
Appearance.setColorScheme("dark")

// Trava de segurança: se algo (sistema, janela nova, lib nativa) reportar outro
// esquema, reaplicamos o dark.
Appearance.addChangeListener(applyDarkMode)

export { applyDarkMode }
