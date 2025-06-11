import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
    //baseURL: 'http://192.168.56.1:3000/api',
    baseURL: 'http://localhost:3000/api', // URL para desenvolvimento local
    //baseURL: 'http://172.18.21.224:3000/api',
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;