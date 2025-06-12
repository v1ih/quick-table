import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { MaterialIcons } from '@expo/vector-icons';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [senha, setSenha] = useState('');
    const [confirmSenha, setConfirmSenha] = useState('');
    const [senhaError, setSenhaError] = useState(false);
    const [confirmSenhaError, setConfirmSenhaError] = useState(false);
    const [showSenha, setShowSenha] = useState(false);
    const [showConfirmSenha, setShowConfirmSenha] = useState(false);
    const [token, setToken] = useState('');
    const [tokenError, setTokenError] = useState(false);
    const [generatedToken, setGeneratedToken] = useState('');
    const [tokenStep, setTokenStep] = useState(false);
    const router = useRouter();

    function validarEmail(email: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    function validarSenha(senha: string) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(senha);
    }

    const handleVerifyEmail = async () => {
        setEmailError(false);
        setTokenError(false);
        setSenhaError(false);
        setConfirmSenhaError(false);
        if (!validarEmail(email)) {
            setEmailError(true);
            Alert.alert('Erro', 'Digite um e-mail válido.');
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setEmailVerified(true);
            // Gera um token simulado (6 dígitos)
            const fakeToken = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedToken(fakeToken);
            setTokenStep(true);
            Alert.alert('Sucesso', 'Se o e-mail estiver cadastrado, você receberá um token para redefinir sua senha.');
        } catch (error: any) {
            setEmailError(true);
            Alert.alert('Erro', 'Erro ao solicitar recuperação de senha.');
        } finally {
            setLoading(false);
        }
    };

    const handleTokenSubmit = () => {
        setTokenError(false);
        if (token.trim() === '') {
            setTokenError(true);
            Alert.alert('Erro', 'Informe o token recebido.');
            return;
        }
        if (token !== generatedToken) {
            setTokenError(true);
            Alert.alert('Erro', 'Token inválido.');
            return;
        }
        setTokenStep(false); // Libera os campos de senha
    };

    const handleResetPassword = async () => {
        setSenhaError(false);
        setConfirmSenhaError(false);
        setTokenError(false);
        if (token.trim() === '') {
            setTokenError(true);
            Alert.alert('Erro', 'Informe o token recebido por e-mail.');
            return;
        }
        if (!validarSenha(senha)) {
            setSenhaError(true);
            Alert.alert('Erro', 'A senha deve ter pelo menos 8 caracteres, incluindo número, letra maiúscula e minúscula.');
            return;
        }
        if (senha !== confirmSenha) {
            setConfirmSenhaError(true);
            Alert.alert('Erro', 'As senhas não coincidem.');
            return;
        }
        setLoading(true);
        try {
            // Simulação: o token é aceito se não estiver vazio
            await api.post('/auth/reset-password', { email, token, senha });
            Alert.alert('Sucesso', 'Senha redefinida com sucesso!');
            router.replace('/auth/login');
        } catch (error: any) {
            Alert.alert('Erro', 'Erro ao redefinir a senha.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Image
                source={require('../../assets/images/quicktable_logo.png')}
                style={styles.logo}
                resizeMode="contain"
            />
            <Text style={styles.title}>Recuperar Senha</Text>
            <Text style={styles.subtitle}>Informe seu e-mail para receber instruções de recuperação.</Text>
            <TextInput
                style={[styles.input, emailError && styles.inputError]}
                placeholder="E-mail"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor="#aaa"
                autoCapitalize="none"
                editable={!emailVerified}
            />
            {!emailVerified && (
                <TouchableOpacity style={styles.button} onPress={handleVerifyEmail} disabled={loading}>
                    <Text style={styles.buttonText}>{loading ? 'Enviando...' : 'Verificar E-mail'}</Text>
                </TouchableOpacity>
            )}
            {emailVerified && (
                <>
                    <Text style={styles.subtitle}>Seu token de recuperação (simulado): <Text style={{fontWeight:'bold', color:'#ff7a00'}}>{generatedToken}</Text></Text>
                    {tokenStep ? (
                        <>
                            <TextInput
                                style={[styles.input, tokenError && styles.inputError]}
                                placeholder="Token"
                                value={token}
                                onChangeText={setToken}
                                placeholderTextColor="#aaa"
                                autoCapitalize="none"
                            />
                            <TouchableOpacity style={styles.button} onPress={handleTokenSubmit} disabled={loading}>
                                <Text style={styles.buttonText}>Validar Token</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <Text style={styles.subtitle}>Digite sua nova senha:</Text>
                            <View style={{ width: '100%', position: 'relative' }}>
                                <TextInput
                                    style={[styles.input, senhaError && styles.inputError]}
                                    placeholder="Nova Senha"
                                    secureTextEntry={!showSenha}
                                    value={senha}
                                    onChangeText={setSenha}
                                    placeholderTextColor="#aaa"
                                />
                                <TouchableOpacity style={styles.showButton} onPress={() => setShowSenha((v) => !v)}>
                                    <MaterialIcons name={showSenha ? 'visibility-off' : 'visibility'} size={22} color="#ff7a00" />
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={[styles.input, confirmSenhaError && styles.inputError]}
                                placeholder="Confirme a Nova Senha"
                                secureTextEntry={!showConfirmSenha}
                                value={confirmSenha}
                                onChangeText={setConfirmSenha}
                                placeholderTextColor="#aaa"
                            />
                            <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading}>
                                <Text style={styles.buttonText}>{loading ? 'Enviando...' : 'Redefinir Senha'}</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </>
            )}
            <TouchableOpacity onPress={() => router.replace('/auth/login')}>
                <Text style={styles.link}>Voltar para o login</Text>
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
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 16,
        color: '#6c6c80',
        marginBottom: 16,
        textAlign: 'center',
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

export default ForgotPassword;
