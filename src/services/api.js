import axios from 'axios'

const api = axios.create({
    baseURL: `http://192.168.15.6:3000/v1.0.0`,
});

export default api;