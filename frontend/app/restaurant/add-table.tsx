import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

const AddTable = () => {
    const [numero, setNumero] = useState('');
    const [capacidade, setCapacidade] = useState('');
    const [descricao, setDescricao] = useState('');
    const [disponivel, setDisponivel] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkRestauranteId = async () => {
            const restauranteId = await AsyncStorage.getItem('restauranteId');
            console.log('Restaurante ID no useEffect do AddTable:', restauranteId);
        };
        checkRestauranteId();
    }, []);

    useEffect(() => {
        const backAction = () => {
            router.replace('/restaurant/manage-tables');
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, []);

    const handleAddTable = async () => {
        if (!numero || !capacidade || !descricao) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        try {
            const restauranteId = await AsyncStorage.getItem('restauranteId'); // Retrieve restauranteId from storage
            console.log('Restaurante ID recuperado:', restauranteId);
            if (!restauranteId) {
                Alert.alert('Erro', 'ID do restaurante não encontrado. Certifique-se de que o restaurante foi registrado corretamente.');
                return;
            }

            const payload = {
                numero,
                capacidade,
                descricao,
                disponivel,
                restauranteId: JSON.parse(restauranteId),
            };

            console.log('Enviando payload para o backend:', payload);

            const response = await api.post('/mesas', payload);
            if (response.status === 201) {
                Alert.alert('Sucesso', 'Mesa adicionada com sucesso!', [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/restaurant/manage-tables'),
                    },
                ]);
            } else {
                Alert.alert('Erro', 'Erro ao adicionar mesa. Verifique os dados e tente novamente.');
            }
        } catch (error) {
            console.error('Erro ao adicionar mesa:', error);
            Alert.alert('Erro', 'Erro ao adicionar mesa. Tente novamente mais tarde.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Adicionar Mesa</Text>

            <TextInput
                style={styles.input}
                placeholder="Número da Mesa"
                value={numero}
                onChangeText={setNumero}
            />

            <TextInput
                style={styles.input}
                placeholder="Capacidade"
                keyboardType="numeric"
                value={capacidade}
                onChangeText={setCapacidade}
            />

            <TextInput
                style={styles.input}
                placeholder="Descrição"
                value={descricao}
                onChangeText={setDescricao}
            />

            <TouchableOpacity
                style={[styles.toggleButton, disponivel ? styles.available : styles.unavailable]}
                onPress={() => setDisponivel(!disponivel)}
            >
                <Text style={styles.buttonText}>{disponivel ? 'Disponível' : 'Indisponível'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.addButton} onPress={handleAddTable}>
                <Text style={styles.buttonText}>Adicionar Mesa</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    addButton: {
        backgroundColor: '#007BFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    toggleButton: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    available: {
        backgroundColor: '#28A745',
    },
    unavailable: {
        backgroundColor: '#DC3545',
    },
});

export default AddTable;