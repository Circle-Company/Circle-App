import { registerRootComponent } from "expo"

import StorybookUIRoot from "./.rnstorybook"

/**
 * Entrada do app quando o Storybook está ligado.
 *
 * Fica num arquivo separado (e não dentro do `index.js`) porque o import de
 * `./.rnstorybook` precisa ser estático para o Metro resolvê-lo, e um import
 * estático no `index.js` puxaria o Storybook para o bundle de produção mesmo
 * com a flag desligada.
 */
registerRootComponent(StorybookUIRoot)
