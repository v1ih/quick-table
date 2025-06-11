import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, BackHandler } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Title, Button, TextInput, Paragraph } from 'react-native-paper';
import api from '../../services/api';

const EditTable = () => {
    const router = useRouter();
    const searchParams = useLocalSearchParams();
    const id = searchParams.id;
    const [numero, setNumero] = useState('');
    const [capacidade, setCapacidade] = useState('');
    const [descricao, setDescricao] = useState('');
    const [disponivel, setDisponivel] = useState(true);

    useEffect(() => {
        console.log('ID recebido:', id); // Adiciona um log para verificar o valor do ID
        const fetchTableData = async () => {
            try {
                const response = await api.get(`/mesas/${id}`);
                console.log('Dados da mesa recebidos:', response.data); // Log dos dados recebidos
                const { numero, capacidade, descricao, disponivel } = response.data;
                setNumero(numero);
                setCapacidade(capacidade);
                setDescricao(descricao);
                setDisponivel(disponivel);
            } catch (error) {
                console.error('Erro ao carregar os dados da mesa:', error); // Log do erro
                Alert.alert('Erro', 'Não foi possível carregar os dados da mesa.');
            }
        };

        if (id) {
            fetchTableData();
        }
    }, [id]);

    useEffect(() => {
        if (numero || capacidade || descricao) {
            console.log('Dados carregados nos campos:', { numero, capacidade, descricao, disponivel });
        }
    }, [numero, capacidade, descricao, disponivel]);

    useEffect(() => {
        const backAction = () => {
            Alert.alert(
                'Descartar alterações',
                'Tem certeza de que deseja descartar as alterações e voltar para Gerenciar Mesas?',
                [
                    {
                        text: 'Cancelar',
                        onPress: () => null,
                        style: 'cancel',
                    },
                    {
                        text: 'Sim',
                        onPress: () => router.replace('/restaurant/manage-tables'),
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
        if (!numero || !capacidade || !descricao) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        try {
            await api.put(`/mesas/${id}`, {
                numero,
                capacidade,
                descricao,
                disponivel,
            });
            Alert.alert('Sucesso', 'Mesa atualizada com sucesso!', [
                {
                    text: 'OK',
                    onPress: () => router.replace('/restaurant/manage-tables'),
                },
            ]);
        } catch (error) {
            Alert.alert('Erro', 'Erro ao atualizar a mesa.');
        }
    };

    return (
        <View style={styles.container}>
            <Title style={styles.title}>Editar Mesa</Title>
            <TextInput
                mode="outlined"
                style={styles.input}
                label="Número da Mesa"
                value={numero.toString()}
                onChangeText={setNumero}
            />
            <TextInput
                mode="outlined"
                style={styles.input}
                label="Capacidade"
                keyboardType="numeric"
                value={capacidade.toString()}
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
            <Button mode="contained" style={styles.saveButton} onPress={handleSave} labelStyle={styles.buttonText}>
                Salvar Alterações
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
    },
    saveButton: {
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

export default EditTable;