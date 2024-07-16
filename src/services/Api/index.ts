import axios from "axios"
import config from "../../config"
import { routes as momentRoutes } from "./routes/moment"

const PATH = config.PRODUCTION
    ? `http://${config.CIRCLE_SYSTEM_API}/v${config.API_VERSION}`
    : `http://192.168.15.12:3000/v${config.API_VERSION}`

const api = axios.create({ baseURL: PATH })

export default api

export const API = api

export const apiRoutes = {
    moment: momentRoutes,
}
