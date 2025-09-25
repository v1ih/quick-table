import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
    //baseURL: 'http://192.168.18.63:3000/api', // Usar quando estiver no WiFi: WIFI GRATIS_2Ghz ou WIFI GRATIS_5Ghz
    baseURL: 'http://192.168.56.1:3000/api', // Usar quando estiver em uma máquina virtual ou emulador com IP
    //baseURL: 'http://localhost:3000/api', // Usar quando o backend estiver rodando na mesma máquina do frontend
    //baseURL: 'http://172.18.23.45:3000/api', // Usar quando estiver no WiFi: aedb
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