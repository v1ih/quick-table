import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuth from '../../hooks/useAuth';

const Home = () => {
    useAuth(); // Verifica se o usuário está autenticado

    const router = useRouter();
    const [user, setUser] = useState<{ tipo: string } | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const storedUser = await AsyncStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const backAction = () => {
            Alert.alert('Confirmação', 'Deseja realmente sair para a tela inicial?', [
                {
                    text: 'Cancelar',
                    onPress: () => null,
                    style: 'cancel',
                },
                {
                    text: 'Sim',
                    onPress: () => router.replace('/'),
                },
            ]);
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, []);

    const handleNavigateToProfile = () => {
        router.push('/common/profile');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bem-vindo ao QuickTable!</Text>
            <Text style={styles.subtitle}>Escolha uma opção abaixo:</Text>

            <View style={styles.section}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleNavigateToProfile}
                >
                    <Text style={styles.buttonText}>Meu Perfil</Text>
                </TouchableOpacity>
            </View>

            {user?.tipo === 'restaurante' && (
                <View style={styles.section}>
                    {/* <Text style={styles.sectionTitle}>Restaurante</Text> */}
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.push('/restaurant/register-restaurant')}
                    >
                        <Text style={styles.buttonText}>Cadastrar Restaurante</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.push('/restaurant/edit-restaurant')}
                    >
                        <Text style={styles.buttonText}>Editar Restaurante</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.push('/restaurant/manage-tables')}
                    >
                        <Text style={styles.buttonText}>Gerenciar Mesas</Text>
                    </TouchableOpacity>
                </View>
            )}

            {user?.tipo === 'cliente' && (
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.push('/client/list-restaurants')}
                    >
                        <Text style={styles.buttonText}>Listar Restaurantes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.push('/client/my-reservations')}
                    >
                        <Text style={styles.buttonText}>Minhas Reservas</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f4f5f6', // fundo escuro moderno
    },
    title: {
        fontSize: 30,
        fontWeight: '700',
        color: '#0f0f0f',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#a0a0a0',
        marginBottom: 30,
        textAlign: 'center',
    },
    section: {
        marginBottom: 30,
        width: '100%',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#9d79ff',
        marginBottom: 15,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    button: {
        backgroundColor: '#1e1e2f',
        paddingVertical: 14,
        paddingHorizontal: 25,
        borderRadius: 12,
        marginBottom: 15,
        width: '90%',
        alignItems: 'center',
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#2e2e3e',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
});


export default Home;