import axios from 'axios'
import config from '../config'

const API_URL = config.CIRCLE_SYSTEM_API + 'v' + config.API_VERSION

const api = axios.create({
    baseURL: API_URL
});

export default api;