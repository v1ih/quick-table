import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import { MaterialIcons } from '@expo/vector-icons';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [senhaError, setSenhaError] = useState(false);
    const [showSenha, setShowSenha] = useState(false);
    const router = useRouter();

    function validarEmail(email: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    const handleLogin = async () => {
        setEmailError(false);
        setSenhaError(false);
        if (email === '' || !validarEmail(email)) {
            setEmailError(true);
            Alert.alert('Erro', 'Digite um e-mail válido.');
            return;
        }
        if (password === '') {
            setSenhaError(true);
            Alert.alert('Erro', 'Digite sua senha.');
            return;
        }

        try {
            const response = await api.post('/auth/login', { email, senha: password });
            const { token, ...user } = response.data;
            await AsyncStorage.setItem('user', JSON.stringify(user));
            await AsyncStorage.setItem('token', token);

            Alert.alert('Sucesso', 'Login realizado com sucesso!');
            router.replace('/common/home');
        } catch (error) {
            Alert.alert('Erro', 'Erro ao realizar login. Tente novamente.');
        }
    };

    return (
        <View style={styles.container}>
            <Image
                source={require('../../assets/images/quicktable_logo.png')}
                style={styles.logo}
                resizeMode="contain"
            />
            <Text style={styles.title}>Login</Text>

            <TextInput
                style={[styles.input, emailError && styles.inputError]}
                placeholder="E-mail"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor="#aaa"
                autoCapitalize="none"
            />

            <View style={{ width: '100%', position: 'relative' }}>
                <TextInput
                    style={[styles.input, senhaError && styles.inputError]}
                    placeholder="Senha"
                    secureTextEntry={!showSenha}
                    value={password}
                    onChangeText={setPassword}
                    placeholderTextColor="#aaa"
                />
                <TouchableOpacity style={styles.showButton} onPress={() => setShowSenha((v) => !v)}>
                    <MaterialIcons name={showSenha ? 'visibility-off' : 'visibility'} size={22} color="#ff7a00" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
                <Text style={styles.link}>Esqueci minha senha</Text>
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
        backgroundColor: '#f9f9fb',
        paddingHorizontal: 24,
    },
    logo: {
        width: 120,
        height: 120,
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
        marginBottom: 24,
        textAlign: 'center',
        letterSpacing: 1,
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
    inputError: {
        borderColor: '#ff3b30',
        borderWidth: 2,
    },
    button: {
        backgroundColor: '#ff7a00',
        paddingVertical: 16,
        borderRadius: 14,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#ff7a00',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 6,
        elevation: 3,
        marginBottom: 16,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    link: {
        color: '#ff7a00',
        fontSize: 14,
        fontWeight: '500',
        marginTop: 8,
    },
    showButton: {
        position: 'absolute',
        right: 16,
        top: 0,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
});

export default Login;