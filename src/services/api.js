import axios from "axios"
import config from "../config"

const PATH = config.PRODUCTION
    ? `http://${config.CIRCLE_SYSTEM_API}/v${config.API_VERSION}`
    : `http://192.168.15.12:3000/v${config.API_VERSION}`

const api = axios.create({
    baseURL: PATH,
})

export default api
