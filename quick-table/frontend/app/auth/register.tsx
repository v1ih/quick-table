import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import api from '../../services/api';

const Register = () => {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [tipo, setTipo] = useState('cliente'); // cliente ou restaurante
    const router = useRouter();

    const handleRegister = async () => {
        if (nome === '' || email === '' || senha === '') {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
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
                // Exibir a mensagem de erro retornada pelo backend
                Alert.alert('Erro', error.response.data.erro);
            } else if (error.request) {
                // Nenhuma resposta do servidor
                Alert.alert('Erro', 'O servidor não respondeu. Verifique sua conexão ou o IP configurado.');
            } else {
                // Outro tipo de erro
                Alert.alert('Erro', 'Erro inesperado: ' + error.message);
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Cadastro</Text>

            <TextInput
                style={styles.input}
                placeholder="Nome"
                value={nome}
                onChangeText={setNome}
            />

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
                value={senha}
                onChangeText={setSenha}
            />

            <Text style={styles.label}>Tipo de Usuário</Text>
            <Picker
                selectedValue={tipo}
                onValueChange={(itemValue) => setTipo(itemValue)}
                style={styles.picker}
            >
                <Picker.Item label="Cliente" value="cliente" />
                <Picker.Item label="Restaurante" value="restaurante" />
            </Picker>

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
    label: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
    picker: {
        width: '100%',
        height: 52,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#dcdcdc',
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


export default Register;