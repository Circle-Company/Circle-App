import axios from "axios"
import config from "../../config"
import { routes as accountRoutes } from "./routes/account"
import { routes as momentRoutes } from "./routes/moment"
import { routes as notificationRoutes } from "./routes/notification"
import { routes as userRoutes } from "./routes/user"

const PATH = `http://${config.ENDPOINT}/v${config.API_VERSION}`
const api = axios.create({ baseURL: PATH })

export default api

export const API = api

export const apiRoutes = {
    account: accountRoutes,
    moment: momentRoutes,
    user: userRoutes,
    notification: notificationRoutes,
}
