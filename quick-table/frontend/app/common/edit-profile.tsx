import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api'; // Corrigi o caminho para o arquivo api.js
import { useRouter } from 'expo-router';

const EditProfile = () => {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const router = useRouter();

    const formatPhone = (text: string) => {
        return text
            .replace(/\D/g, '') // Remove non-numeric characters
            .replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') // Format as (XX) XXXXX-XXXX
            .slice(0, 15); // Limit to 15 characters
    };

    useEffect(() => {
        const fetchUserData = async () => {
            const storedUser = await AsyncStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setNome(parsedUser.nome);
                setEmail(parsedUser.email);
                setTelefone(parsedUser.telefone || '');
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const backAction = () => {
            Alert.alert(
                'Descartar alterações',
                'Tem certeza de que deseja descartar as alterações e voltar para o perfil?',
                [
                    {
                        text: 'Cancelar',
                        onPress: () => null,
                        style: 'cancel',
                    },
                    {
                        text: 'Sim',
                        onPress: () => router.replace('/common/profile'),
                    },
                ]
            );
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, []);

    const handleSave = async () => {
        try {
            const response = await api.put('/auth/perfil', { nome, email, telefone }); // Corrigi a URL para corresponder ao backend
            const updatedUser = response.data.usuario;

            // Atualizar os dados no AsyncStorage
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

            Alert.alert('Sucesso', 'Perfil atualizado com sucesso!', [
                {
                    text: 'OK',
                    onPress: () => router.replace('/common/profile'),
                },
            ]);
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            Alert.alert('Erro', 'Não foi possível atualizar o perfil. Tente novamente.');
        }
    };

    const handleDeleteAccount = async () => {
        Alert.alert(
            'Confirmação',
            'Tem certeza de que deseja excluir sua conta?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete('/auth/perfil'); // Corrigi a URL para corresponder ao backend
                            await AsyncStorage.removeItem('user');
                            Alert.alert('Sucesso', 'Conta excluída com sucesso!');
                            router.replace('/auth/login');
                        } catch (error) {
                            console.error('Erro ao excluir conta:', error);
                            Alert.alert('Erro', 'Não foi possível excluir a conta.');
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Editar Perfil</Text>

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
                placeholder="Telefone"
                keyboardType="phone-pad"
                value={telefone}
                onChangeText={(text) => setTelefone(formatPhone(text))}
            />

            <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Salvar Alterações</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeleteAccount}>
                <Text style={styles.buttonText}>Excluir Conta</Text>
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
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        width: '100%',
        height: 52,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#d0d0d0',
        fontSize: 15,
    },
    button: {
        backgroundColor: '#4A44C6',
        paddingVertical: 14,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    deleteButton: {
        backgroundColor: '#FF4C4C',
    },
});


export default EditProfile;