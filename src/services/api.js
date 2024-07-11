import axios from 'axios'
import config from '../config'

const api = axios.create({
    baseURL: `http://${config.CIRCLE_SYSTEM_API}/v${config.API_VERSION}`
});

export default api;