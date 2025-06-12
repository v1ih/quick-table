import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, BackHandler, Image } from 'react-native';
import { useRouter } from 'expo-router';
import useAuth from '../../hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';

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
            <LinearGradient
                colors={['#fffaf5', '#fff7f0', '#f9f9fb']}
                style={styles.gradientBg}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            >
                <Text style={styles.title}>Meu Perfil</Text>
                <View style={styles.avatarWrapper}>
                    <Image
                        source={fotoPerfil ? { uri: fotoPerfil } : require('../../assets/images/profile_default.jpeg')}
                        style={styles.image}
                    />
                </View>
                {user ? (
                    <View style={styles.infoContainer}>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Nome:</Text>
                            <Text style={[styles.value, !user.nome && styles.valueMissing]}>{user.nome || 'Não informado'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>E-mail:</Text>
                            <Text style={[styles.value, !user.email && styles.valueMissing]}>{user.email || 'Não informado'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Telefone:</Text>
                            <Text style={[styles.value, !user.telefone && styles.valueMissing]}>{user.telefone || 'Não informado'}</Text>
                        </View>
                    </View>
                ) : (
                    <Text>Carregando...</Text>
                )}
                <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                    <Text style={styles.editButtonText}>Editar Perfil</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Sair</Text>
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fffaf5',
    },
    gradientBg: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 0,
        paddingTop: 40,
        paddingBottom: 0,
    },
    title: {
        fontSize: 30,
        fontWeight: '800',
        color: '#ff7a00',
        marginBottom: 16,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    avatarWrapper: {
        alignItems: 'center',
        marginBottom: 24,
        width: '100%',
    },
    image: {
        width: 140,
        height: 140,
        borderRadius: 70,
        marginBottom: 12,
        backgroundColor: '#ffe3c2',
        borderWidth: 4,
        borderColor: '#ffb366',
    },
    infoContainer: {
        width: '99%',
        marginBottom: 36,
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 32,
        shadowColor: '#ffb366',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.10,
        shadowRadius: 16,
        elevation: 5,
        gap: 14,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
        gap: 10,
    },
    label: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ff7a00',
        minWidth: 90,
    },
    value: {
        fontSize: 18,
        color: '#22223b',
        fontWeight: '500',
        flex: 1,
    },
    valueMissing: {
        color: '#b0b0b0',
        fontStyle: 'italic',
    },
    editButton: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#ff7a00',
        borderRadius: 16,
        width: '99%',
        alignItems: 'center',
        paddingVertical: 20,
        marginBottom: 18,
        shadowColor: '#ffb366',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 6,
        elevation: 2,
    },
    editButtonText: {
        color: '#ff7a00',
        fontSize: 19,
        fontWeight: 'bold',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    logoutButton: {
        backgroundColor: '#ff7a00',
        borderRadius: 16,
        width: '99%',
        alignItems: 'center',
        paddingVertical: 20,
        marginBottom: 8,
        shadowColor: '#ffb366',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 6,
        elevation: 2,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 19,
        fontWeight: 'bold',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
});


export default Profile;