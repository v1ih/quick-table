import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import api from '../../services/api';
import { MaterialIcons } from '@expo/vector-icons';

const Register = () => {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmSenha, setConfirmSenha] = useState('');
    const [tipo, setTipo] = useState('cliente'); // cliente ou restaurante
    const [showSenha, setShowSenha] = useState(false);
    const [showConfirmSenha, setShowConfirmSenha] = useState(false);
    const [nomeError, setNomeError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [senhaError, setSenhaError] = useState(false);
    const [confirmSenhaError, setConfirmSenhaError] = useState(false);
    const router = useRouter();

    function validarEmail(email: string) {
        // Regex básico para e-mail
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validarSenha(senha: string) {
        // Pelo menos 8 caracteres, 1 número, 1 maiúscula, 1 minúscula
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(senha);
    }

    const handleRegister = async () => {
        setNomeError(false);
        setEmailError(false);
        setSenhaError(false);
        setConfirmSenhaError(false);
        let erro = false;
        if (nome === '') {
            setNomeError(true);
            erro = true;
        }
        if (email === '' || !validarEmail(email)) {
            setEmailError(true);
            erro = true;
        }
        if (!validarSenha(senha)) {
            setSenhaError(true);
            erro = true;
        }
        if (senha !== confirmSenha || confirmSenha === '') {
            setConfirmSenhaError(true);
            erro = true;
        }
        if (erro) {
            Alert.alert('Erro', 'Verifique os campos destacados.');
            return;
        }

        try {
            const response = await api.post('/auth/register', {
                nome,
                email,
                senha,
                tipo,
            });

            if (response.status === 200 || response.status === 201) {
                Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
                router.replace('/auth/login');
            } else {
                Alert.alert('Erro', response.data.erro || 'Erro ao cadastrar usuário.');
            }
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.erro) {
                Alert.alert('Erro', error.response.data.erro);
            } else if (error.request) {
                Alert.alert('Erro', 'O servidor não respondeu. Verifique sua conexão ou o IP configurado.');
            } else {
                Alert.alert('Erro', 'Erro inesperado: ' + error.message);
            }
        }
    };

    return (
        <View style={styles.container}>
            <Image
                source={require('../../assets/images/quicktable_logo.png')}
                style={styles.logo}
                resizeMode="contain"
            />
            <Text style={styles.title}>Cadastro</Text>

            <TextInput
                style={[styles.input, nomeError && styles.inputError]}
                placeholder="Nome"
                value={nome}
                onChangeText={setNome}
                placeholderTextColor="#aaa"
            />

            <TextInput
                style={[styles.input, emailError && styles.inputError]}
                placeholder="E-mail"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor="#aaa"
            />

            <View style={{ width: '100%', position: 'relative' }}>
                <TextInput
                    style={[styles.input, senhaError && styles.inputError]}
                    placeholder="Senha"
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
                placeholder="Confirme a Senha"
                secureTextEntry={!showConfirmSenha}
                value={confirmSenha}
                onChangeText={setConfirmSenha}
                placeholderTextColor="#aaa"
            />

            <Text style={styles.label}>Tipo de Usuário</Text>
            <View style={styles.pickerWrapper}>
                <Picker
                    selectedValue={tipo}
                    onValueChange={(itemValue) => setTipo(itemValue)}
                    style={styles.picker}
                    dropdownIconColor="#ff7a00"
                >
                    <Picker.Item label="Cliente" value="cliente" />
                    <Picker.Item label="Restaurante" value="restaurante" />
                </Picker>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Cadastrar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/auth/login')}>
                <Text style={styles.link}>Já tem uma conta? Faça login</Text>
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
    label: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
    pickerWrapper: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#dcdcdc',
        marginBottom: 20,
        overflow: 'hidden',
    },
    picker: {
        width: '100%',
        height: 52,
        color: '#333',
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

export default Register;