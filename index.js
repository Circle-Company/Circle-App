// Trava o app em modo escuro antes de qualquer tela montar.
import "@/lib/force-dark-mode"

// Storybook on-device: quando ligado (`npm run storybook`), ele substitui o app
// inteiro em vez de virar uma rota. É o comportamento certo aqui — o app real
// monta ~15 providers e decide a tela inicial pela sessão, e nada disso deveria
// rodar para exibir um componente isolado.
//
// A checagem é do valor literal porque o Metro substitui `process.env` por uma
// constante no bundle: com a flag desligada o `require` abaixo é código morto e
// o Storybook não entra na build.
if (process.env.STORYBOOK_ENABLED === "true") {
    require("./.storybook-entry")
} else {
    require("expo-router/entry")
}
