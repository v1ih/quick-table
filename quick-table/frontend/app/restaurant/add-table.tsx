import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Title, Button, TextInput, Paragraph } from 'react-native-paper';
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
            <Title style={styles.title}>Adicionar Mesa</Title>
            <TextInput
                mode="outlined"
                style={styles.input}
                label="Número da Mesa"
                value={numero}
                onChangeText={setNumero}
            />
            <TextInput
                mode="outlined"
                style={styles.input}
                label="Capacidade"
                keyboardType="numeric"
                value={capacidade}
                onChangeText={setCapacidade}
            />
            <TextInput
                mode="outlined"
                style={styles.input}
                label="Descrição"
                value={descricao}
                onChangeText={setDescricao}
            />
            <Button
                mode={disponivel ? 'contained' : 'outlined'}
                style={[styles.toggleButton, disponivel ? styles.available : styles.unavailable]}
                onPress={() => setDisponivel(!disponivel)}
                labelStyle={styles.buttonText}
            >
                {disponivel ? 'Disponível' : 'Indisponível'}
            </Button>
            <Button mode="contained" style={styles.addButton} onPress={handleAddTable} labelStyle={styles.buttonText}>
                Adicionar Mesa
            </Button>
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