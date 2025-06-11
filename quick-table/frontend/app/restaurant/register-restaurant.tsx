import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import { Title, Button, TextInput, Paragraph } from 'react-native-paper';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterRestaurant = () => {
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [horarioInicio, setHorarioInicio] = useState('');
    const [horarioFim, setHorarioFim] = useState('');
    const [descricao, setDescricao] = useState('');
    const [localizacao, setLocalizacao] = useState('');
    const router = useRouter();

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

    // Add real-time formatting for phone and time inputs
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

    // Ensure horarioInicio and horarioFim are formatted as HH:MM
    const handleRegister = async () => {
        if (!nome || !telefone || !horarioInicio || !horarioFim || !descricao || !localizacao) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        // Format horarioInicio and horarioFim to HH:MM
        const formattedHorarioInicio = horarioInicio.includes(':') ? horarioInicio : `${horarioInicio}:00`;
        const formattedHorarioFim = horarioFim.includes(':') ? horarioFim : `${horarioFim}:00`;

        console.log('Dados enviados para o backend:', { nome, telefone, horarioInicio: formattedHorarioInicio, horarioFim: formattedHorarioFim, descricao, localizacao });

        try {
            const response = await api.post('/restaurantes', {
                nome,
                telefone,
                horarioInicio: formattedHorarioInicio,
                horarioFim: formattedHorarioFim,
                descricao,
                localizacao,
            });

            console.log('Resposta do backend:', response.data);

            if (response.status === 201) {
                const restauranteId = response.data.id || response.data.restaurante?.id;
                if (!restauranteId) {
                    Alert.alert('Erro', 'ID do restaurante não encontrado na resposta do backend.');
                    return;
                }
                console.log('Salvando restauranteId no AsyncStorage:', restauranteId);
                await AsyncStorage.setItem('restauranteId', JSON.stringify(restauranteId));
                console.log('Restaurante ID salvo no AsyncStorage:', restauranteId);

                Alert.alert('Sucesso', 'Restaurante registrado com sucesso!', [
                    {
                        text: 'OK',
                        onPress: () => router.push('/common/home'),
                    },
                ]);
            } else {
                Alert.alert('Erro', response.data.erro || 'Erro ao cadastrar restaurante.');
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível realizar o registro. Tente novamente.');
        }
    };

    return (
        <View style={styles.container}>
            <Title style={styles.title}>Cadastro de Restaurante</Title>
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
            <TextInput
                mode="outlined"
                style={styles.input}
                label="Descrição do Restaurante"
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
            <Button mode="contained" style={styles.button} onPress={handleRegister} labelStyle={styles.buttonText}>
                Cadastrar
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
    buttonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});


export default RegisterRestaurant;