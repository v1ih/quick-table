import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, BackHandler } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../../services/api';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Button, Title, Paragraph, TextInput as PaperInput } from 'react-native-paper';

const MakeReservation = () => {
    const { id, mesaId } = useLocalSearchParams();
    const router = useRouter();
    const [reservationDate, setReservationDate] = useState(new Date());
    const [reservationTime, setReservationTime] = useState('');
    const [numeroPessoas, setNumeroPessoas] = useState('');
    const [observacao, setObservacao] = useState('');
    const [restaurant, setRestaurant] = useState<{ horarioInicio: string; horarioFim: string } | null>(null);

    useEffect(() => {
        const fetchRestaurantDetails = async () => {
            try {
                const response = await api.get(`/restaurantes/${id}`);
                setRestaurant(response.data);
            } catch (error) {
                Alert.alert('Erro', 'Não foi possível carregar os detalhes do restaurante.');
            }
        };

        if (id) {
            fetchRestaurantDetails();
        }
    }, [id]);

    const showDatePicker = () => {
        DateTimePickerAndroid.open({
            value: reservationDate,
            onChange: (event, selectedDate) => {
                if (selectedDate) {
                    setReservationDate(selectedDate);
                }
            },
            mode: 'date',
        });
    };

    const showTimePicker = () => {
        if (!restaurant) return;

        const [startHour, startMinute] = restaurant.horarioInicio.split(':').map(Number);
        const [endHour, endMinute] = restaurant.horarioFim.split(':').map(Number);

        const now = new Date();
        const minTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute);
        const maxTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, endMinute);

        DateTimePickerAndroid.open({
            value: minTime,
            onChange: (event, selectedTime) => {
                if (selectedTime) {
                    if (selectedTime >= minTime && selectedTime <= maxTime) {
                        const hours = selectedTime.getHours().toString().padStart(2, '0');
                        const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
                        setReservationTime(`${hours}:${minutes}`);
                    } else {
                        Alert.alert('Erro', `Selecione um horário válido. O restaurante funciona das ${restaurant.horarioInicio} às ${restaurant.horarioFim}.`);
                    }
                }
            },
            mode: 'time',
            is24Hour: true,
        });
    };

    const handleReservation = async () => {
        if (!reservationDate || !reservationTime || !numeroPessoas) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        try {
            const formattedDate = reservationDate.toISOString().split('T')[0];
            const payload = {
                restauranteId: id,
                mesaId: mesaId,
                dataHora: `${formattedDate}T${reservationTime}:00`,
                numeroPessoas: parseInt(numeroPessoas, 10),
                observacao: observacao || null,
            };

            const response = await api.post('/reservas', payload);

            if (response.status === 201) {
                const reserva = response.data;
                Alert.alert(
                    'Reserva Confirmada',
                    `Sua reserva foi realizada com sucesso!\n\nMesa: ${reserva.mesaId}\nData: ${formattedDate}\nHorário: ${reservationTime}`,
                    [
                        {
                            text: 'OK',
                            onPress: () => router.replace('/client/list-restaurants'),
                        },
                    ]
                );

                // Limpar o formulário
                setReservationDate(new Date());
                setReservationTime('');
                setNumeroPessoas('');
                setObservacao('');
            } else {
                Alert.alert('Erro', 'Erro ao realizar a reserva. Verifique os dados e tente novamente.');
            }
        } catch (error) {
            console.error('Erro ao realizar reserva:', error);
            Alert.alert('Erro', 'Não foi possível realizar a reserva. Tente novamente mais tarde.');
        }
    };

    const handleBackToDetails = () => {
        router.replace(`/client/restaurant-details?id=${id}`);
    };

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            handleBackToDetails();
            return true;
        });

        return () => backHandler.remove();
    }, []);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Title style={styles.title}>Realizar Reserva</Title>
            <Paragraph style={styles.label}>Data</Paragraph>
            <Button mode="outlined" onPress={showDatePicker} style={styles.input} labelStyle={{ color: '#333' }}>
                {reservationDate.toISOString().split('T')[0]}
            </Button>
            <Paragraph style={styles.label}>Horário</Paragraph>
            <Paragraph style={styles.infoText}>
                Por favor, selecione um horário entre {restaurant?.horarioInicio} e {restaurant?.horarioFim}.
            </Paragraph>
            <Button mode="outlined" onPress={showTimePicker} style={styles.input} labelStyle={{ color: '#333' }}>
                {reservationTime || 'Selecionar Horário'}
            </Button>
            <Paragraph style={styles.label}>Número de Pessoas</Paragraph>
            <PaperInput
                mode="outlined"
                style={styles.input}
                placeholder="Número de Pessoas"
                keyboardType="numeric"
                value={numeroPessoas}
                onChangeText={setNumeroPessoas}
            />
            <Paragraph style={styles.label}>Observação</Paragraph>
            <PaperInput
                mode="outlined"
                style={styles.input}
                placeholder="Observação (opcional)"
                value={observacao}
                onChangeText={setObservacao}
            />
            <Button mode="contained" style={styles.button} onPress={handleReservation} labelStyle={styles.buttonText}>
                Reservar
            </Button>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
        color: '#555',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        fontSize: 16,
        justifyContent: 'center',
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    infoText: {
        fontSize: 14,
        color: '#888',
        marginBottom: 10,
    },
});

export default MakeReservation;