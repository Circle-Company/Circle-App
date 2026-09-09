import * as actions from "./moment.actions"
import * as author from "./moment.author"
import { get } from "./moment.get"
import * as viewers from "./moment.viewers"

export const routes = {
    actions,
    author,
    /** `GET /moments/:id` — payload já normalizado. Ver `moment.get.ts`. */
    get,
    viewers,
}
