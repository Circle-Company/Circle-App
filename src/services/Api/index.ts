import axios from "axios"
import config from "../../config"
import { routes as momentRoutes } from "./routes/moment"
import { routes as userRoutes } from "./routes/user"

const PATH = `http://23.20.95.66:3000/v${config.API_VERSION}`

const api = axios.create({ baseURL: PATH })

export default api

export const API = api

export const apiRoutes = {
    moment: momentRoutes,
    user: userRoutes,
}
