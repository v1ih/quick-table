import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import { Title, Button, TextInput, Paragraph } from 'react-native-paper';
import api from '../../services/api';

const EditRestaurant = () => {
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [localizacao, setLocalizacao] = useState('');
    const [telefone, setTelefone] = useState('');
    const [horarioInicio, setHorarioInicio] = useState('');
    const [horarioFim, setHorarioFim] = useState('');
    const [id, setId] = useState('');
    const router = useRouter();

    const formatPhone = (text: string) => {
        return text
            .replace(/\D/g, '') // Remove non-numeric characters
            .replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') // Format as (XX) XXXXX-XXXX
            .slice(0, 15); // Limit to 15 characters
    };

    const formatTime = (text: string) => {
        return text
            .replace(/\D/g, '') // Remove non-numeric characters
            .replace(/(\d{2})(\d{2})/, '$1:$2') // Format as HH:MM
            .slice(0, 5); // Limit to 5 characters
    };

    useEffect(() => {
        const fetchUserRestaurant = async () => {
            try {
                const response = await api.get('/restaurantes/me'); // Endpoint para buscar o restaurante do usuário
                const { nome, descricao, localizacao, telefone, horarioInicio, horarioFim, id } = response.data;
                setNome(nome);
                setDescricao(descricao);
                setLocalizacao(localizacao);
                setTelefone(telefone);
                setHorarioInicio(horarioInicio);
                setHorarioFim(horarioFim);
                setId(id); // Armazena o ID do restaurante
            } catch (error) {
                Alert.alert('Erro', 'Não foi possível carregar os dados do restaurante.');
            }
        };

        fetchUserRestaurant();
    }, []);

    useEffect(() => {
        const backAction = () => {
            router.replace('/common/home');
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, []);

    const handleSave = async () => {
        if (!nome || !descricao || !localizacao || !telefone || !horarioInicio || !horarioFim) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        try {
            await api.put(`/restaurantes/${id}`, {
                nome,
                descricao,
                localizacao,
                telefone,
                horarioInicio,
                horarioFim,
            });

            Alert.alert('Sucesso', 'Restaurante atualizado com sucesso!', [
                {
                    text: 'OK',
                    onPress: () => router.push('/common/home'),
                },
            ]);
        } catch (error) {
            Alert.alert('Erro', 'Erro ao atualizar o restaurante.');
        }
    };

    const handleDeleteRestaurant = async () => {
        Alert.alert(
            'Confirmação',
            'Tem certeza de que deseja excluir este restaurante? Esta ação não pode ser desfeita.',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/restaurantes/${id}`);
                            Alert.alert('Sucesso', 'Restaurante excluído com sucesso!', [
                                {
                                    text: 'OK',
                                    onPress: () => router.replace('/common/home'),
                                },
                            ]);
                        } catch (error) {
                            Alert.alert('Erro', 'Erro ao excluir o restaurante.');
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Title style={styles.title}>Editar Restaurante</Title>
            <TextInput
                mode="outlined"
                style={styles.input}
                label="Nome do Restaurante"
                value={nome}
                onChangeText={setNome}
            />
            <TextInput
                mode="outlined"
                style={styles.input}
                label="Descrição"
                value={descricao}
                onChangeText={setDescricao}
            />
            <TextInput
                mode="outlined"
                style={styles.input}
                label="Localização"
                value={localizacao}
                onChangeText={setLocalizacao}
            />
            <TextInput
                mode="outlined"
                style={styles.input}
                label="Telefone"
                keyboardType="phone-pad"
                value={telefone}
                onChangeText={(text) => setTelefone(formatPhone(text))}
            />
            <TextInput
                mode="outlined"
                style={styles.input}
                label="Horário de Abertura (HH:MM)"
                keyboardType="numeric"
                value={horarioInicio}
                onChangeText={(text) => setHorarioInicio(formatTime(text))}
            />
            <TextInput
                mode="outlined"
                style={styles.input}
                label="Horário de Fechamento (HH:MM)"
                keyboardType="numeric"
                value={horarioFim}
                onChangeText={(text) => setHorarioFim(formatTime(text))}
            />
            <Button mode="contained" style={styles.button} onPress={handleSave} labelStyle={styles.buttonText}>
                Salvar Alterações
            </Button>
            <Button mode="contained" style={[styles.button, styles.deleteButton]} onPress={handleDeleteRestaurant} labelStyle={styles.buttonText}>
                Excluir Restaurante
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f5f6',
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#0f0f0f',
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        width: '90%',
        height: 50,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        fontSize: 15,
        borderColor: '#ddd',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    button: {
        backgroundColor: '#4A44C6',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 10,
        width: '90%',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    deleteButton: {
        backgroundColor: '#FF4C4C',
        marginTop: 16,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});


export default EditRestaurant;