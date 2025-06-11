import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, BackHandler, Image } from 'react-native';
import { useRouter } from 'expo-router';
import useAuth from '../../hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

const Profile = () => {
    useAuth(); // Verifica se o usuário está autenticado
    const router = useRouter();
    const [user, setUser] = useState<{ nome: string; email: string; telefone?: string } | null>(null);
    const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const storedUser = await AsyncStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);

                // Monta a URL da imagem
                if (parsedUser.fotoPerfil) {
                    const isFullUrl = parsedUser.fotoPerfil.startsWith('http');
                    const urlFinal = isFullUrl
                        ? parsedUser.fotoPerfil
                        : (api.defaults.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, '') : '') + '/' + parsedUser.fotoPerfil.replace(/\\/g, '/');
                    setFotoPerfil(urlFinal);
                } else {
                    setFotoPerfil(null);
                }
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const backAction = () => {
            router.replace('/common/home');
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, []);

    const handleEditProfile = () => {
        router.push('/common/edit-profile');
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('user');
        router.push('/auth/login');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Meu Perfil</Text>

            {/* Imagem do perfil */}
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <Image
                    source={fotoPerfil ? { uri: fotoPerfil } : require('../../assets/images/profile_default.jpeg')}
                    style={styles.image}
                />
            </View>

            {user ? (
                <View style={styles.infoContainer}>
                    <Text style={styles.label}>Nome:</Text>
                    <Text style={styles.value}>{user.nome}</Text>

                    <Text style={styles.label}>E-mail:</Text>
                    <Text style={styles.value}>{user.email}</Text>

                    {user.telefone ? (
                        <>
                            <Text style={styles.label}>Telefone:</Text>
                            <Text style={styles.value}>{user.telefone}</Text>
                        </>
                    ) : null}
                </View>
            ) : (
                <Text>Carregando...</Text>
            )}

            <TouchableOpacity style={styles.button} onPress={handleEditProfile}>
                <Text style={styles.buttonText}>Editar Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
                <Text style={styles.buttonText}>Sair</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f5f6',
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#0f0f0f',
        marginBottom: 24,
        textAlign: 'center',
    },
    infoContainer: {
        width: '90%',
        marginBottom: 32,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        color: '#666',
        marginBottom: 12,
    },
    button: {
        backgroundColor: '#4A44C6',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 10,
        width: '90%',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    logoutButton: {
        backgroundColor: '#FF3B30',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 8,
        backgroundColor: '#e0e0e0',
    },
});


export default Profile;