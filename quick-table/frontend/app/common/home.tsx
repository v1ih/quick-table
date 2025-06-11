import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler, Alert, Image } from 'react-native';
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
            {/* Logo do app */}
            <Image
                source={require('../../assets/images/quicktable_logo.png')} // ajuste o nome se necessário
                style={styles.logo}
                resizeMode="contain"
            />

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
        padding: 24,
        backgroundColor: '#f9f9fb',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e1e2f',
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 16,
        color: '#6c6c80',
        marginBottom: 32,
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
        backgroundColor: '#ff7a00',
        paddingVertical: 16,
        paddingHorizontal: 25,
        borderRadius: 14,
        marginBottom: 18,
        width: '92%',
        alignItems: 'center',
        alignSelf: 'center',
        shadowColor: '#ff7a00',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 0,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    logo: {
        width: 160,
        height: 160,
        marginBottom: 24,
        alignSelf: 'center',
        borderRadius: 20,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
});


export default Home;