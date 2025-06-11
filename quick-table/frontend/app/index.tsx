import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

const Home = () => {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Image
                source={require('../assets/images/quicktable_logo.png')}
                style={styles.logo}
                resizeMode="contain"
            />
            <Text style={styles.title}>Bem-vindo ao QuickTable!</Text>
            <Text style={styles.subtitle}>Gerencie suas reservas de forma rápida e fácil.</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/auth/login')}
            >
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/auth/register')}
            >
                <Text style={styles.buttonText}>Cadastro</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9fb',
        paddingHorizontal: 24,
    },
    logo: {
        width: 140,
        height: 140,
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
        paddingHorizontal: 12,
    },
    button: {
        backgroundColor: '#ff7a00',
        paddingVertical: 16,
        borderRadius: 14,
        width: '100%',
        alignItems: 'center',
        marginBottom: 18,
        shadowColor: '#ff7a00',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 6,
        elevation: 3,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
});

export default Home;