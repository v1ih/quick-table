import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api'; // Corrigi o caminho para o arquivo api.js

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = async () => {
        if (email === '' || password === '') {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        try {
            const response = await api.post('/auth/login', { email, senha: password });
            const { token, ...user } = response.data; // Extrair o token e os dados do usuário
            await AsyncStorage.setItem('user', JSON.stringify(user));
            await AsyncStorage.setItem('token', token); // Salvar o token separadamente

            Alert.alert('Sucesso', 'Login realizado com sucesso!');
            router.replace('/common/home');
        } catch (error) {
            Alert.alert('Erro', 'Erro ao realizar login. Tente novamente.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>

            <TextInput
                style={styles.input}
                placeholder="E-mail"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                style={styles.input}
                placeholder="Senha"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/auth/register')}>
                <Text style={styles.link}>Não tem uma conta? Cadastre-se</Text>
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
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1f1f1f',
        marginBottom: 28,
    },
    input: {
        width: '100%',
        height: 52,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        paddingHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#dcdcdc',
        fontSize: 15,
        color: '#333',
    },
    button: {
        backgroundColor: '#4A44C6',
        paddingVertical: 14,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 16,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    link: {
        color: '#4A44C6',
        fontSize: 14,
        fontWeight: '500',
        marginTop: 8,
    },
});


export default Login;