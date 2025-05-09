import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAuth = (requiredRole?: 'cliente' | 'restaurante') => {
    const router = useRouter();
    const [user, setUser] = useState<{ id: number; tipo: string } | null>(null); // Define o tipo do usuário

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await AsyncStorage.getItem('user');
                const parsedUser = user ? JSON.parse(user) : null;

                if (!parsedUser) {
                    // Redirecionar para login se não estiver autenticado
                    router.push('/auth/login');
                    return;
                }

                if (requiredRole && parsedUser.tipo !== requiredRole) {
                    // Redirecionar para home se o tipo de usuário não for permitido
                    router.push('/common/home');
                }

                setUser(parsedUser);
            } catch (error) {
                console.error('Erro ao verificar autenticação:', error);
            }
        };

        checkAuth();
    }, [requiredRole, router]);

    return { user };
};

export default useAuth;