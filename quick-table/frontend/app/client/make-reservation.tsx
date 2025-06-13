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
    const [mesa, setMesa] = useState<{ capacidade: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [focusedField, setFocusedField] = useState<string | null>(null);

    useEffect(() => {
        const fetchRestaurantDetails = async () => {
            try {
                const response = await api.get(`/restaurantes/${id}`);
                setRestaurant(response.data);
            } catch (error) {
                Alert.alert('Erro', 'Não foi possível carregar os detalhes do restaurante.');
            }
        };
        const fetchMesaDetails = async () => {
            try {
                if (!mesaId) return; // Só tenta buscar se mesaId existe
                const response = await api.get(`/mesas/${mesaId}`);
                // Garante que a resposta tem capacidade (fallback para string ou number)
                let capacidade = response.data.capacidade;
                if (typeof capacidade === 'string') capacidade = parseInt(capacidade, 10);
                setMesa({ capacidade });
            } catch (error) {
                setMesa(null);
                if (mesaId) Alert.alert('Erro', 'Não foi possível carregar os detalhes da mesa.');
            }
        };
        if (id) fetchRestaurantDetails();
        if (mesaId) fetchMesaDetails();
    }, [id, mesaId]);

    const showDatePicker = () => {
        DateTimePickerAndroid.open({
            value: reservationDate,
            minimumDate: new Date(),
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
                        setReservationTime(`${hours}:${minutes}`); // Sem segundos
                    } else {
                        Alert.alert('Erro', `Selecione um horário válido. O restaurante funciona das ${formatHourBR(restaurant.horarioInicio)} às ${formatHourBR(restaurant.horarioFim)}.`);
                    }
                }
            },
            mode: 'time',
            is24Hour: true,
        });
    };

    // Formata data para DD/MM/AAAA
    const formatDateBR = (date: Date) => {
        return date ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth()+1).toString().padStart(2, '0')}/${date.getFullYear()}` : '';
    };

    // Formata hora para HH:MM (sem segundos)
    const formatHourBR = (hora: string) => {
        if (!hora) return '';
        const [h, m] = hora.split(':');
        return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!reservationDate) newErrors.reservationDate = 'Selecione a data.';
        if (!reservationTime) newErrors.reservationTime = 'Selecione o horário.';
        const nPessoas = Number(numeroPessoas);
        if (!numeroPessoas || isNaN(nPessoas) || nPessoas < 1) {
            newErrors.numeroPessoas = 'Informe um número válido de pessoas.';
        } else if (mesa && nPessoas > mesa.capacidade) {
            newErrors.numeroPessoas = `A mesa suporta no máximo ${mesa.capacidade} pessoas.`;
        }
        return newErrors;
    };

    const handleReservation = async () => {
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            Alert.alert('Erro', Object.values(validationErrors).join('\n'));
            return;
        }
        setLoading(true);
        setErrors({});
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
                    `Sua reserva foi realizada com sucesso!\n\nMesa: ${reserva.mesaId}\nData: ${formatDateBR(reservationDate)}\nHorário: ${formatHourBR(reservationTime)}`,
                    [
                        {
                            text: 'OK',
                            onPress: () => router.replace('/client/list-restaurants'),
                        },
                    ]
                );
                setReservationDate(new Date());
                setReservationTime('');
                setNumeroPessoas('');
                setObservacao('');
            } else {
                Alert.alert('Erro', 'Erro ao realizar a reserva. Verifique os dados e tente novamente.');
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível realizar a reserva. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
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
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
                <Title style={styles.title}>Realizar Reserva</Title>
                <View style={styles.formCard}>
                    {/* Campo Data */}
                    <PaperInput
                        mode="outlined"
                        label="Data"
                        value={formatDateBR(reservationDate)}
                        style={[
                            styles.input,
                            errors.reservationDate && styles.inputError,
                            focusedField === 'data' && styles.inputFocused
                        ]}
                        theme={{ colors: { primary: '#ff7a00', background: '#fffaf5' } }}
                        outlineColor="#ffb366"
                        activeOutlineColor="#ff7a00"
                        left={<PaperInput.Icon icon="calendar" color="#ff7a00" onPress={showDatePicker} />}
                        editable={false}
                        onPressIn={showDatePicker}
                        onFocus={() => setFocusedField('data')}
                        onBlur={() => setFocusedField(null)}
                        accessibilityLabel="Campo de data da reserva"
                        returnKeyType="next"
                    />
                    {errors.reservationDate && <Paragraph style={styles.errorText}>{errors.reservationDate}</Paragraph>}
                    {/* Campo Horário */}
                    <PaperInput
                        mode="outlined"
                        label="Horário"
                        value={reservationTime || ''}
                        style={[
                            styles.input,
                            errors.reservationTime && styles.inputError,
                            focusedField === 'hora' && styles.inputFocused
                        ]}
                        theme={{ colors: { primary: '#ff7a00', background: '#fffaf5' } }}
                        outlineColor="#ffb366"
                        activeOutlineColor="#ff7a00"
                        left={<PaperInput.Icon icon="clock-outline" color="#ff7a00" onPress={showTimePicker} />} 
                        editable={false}
                        onPressIn={showTimePicker}
                        onFocus={() => setFocusedField('hora')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Selecionar Horário"
                        accessibilityLabel="Campo de horário da reserva"
                        returnKeyType="next"
                    />
                    <Paragraph style={styles.infoText}>
                        Por favor, selecione um horário entre {formatHourBR(restaurant?.horarioInicio || '')} e {formatHourBR(restaurant?.horarioFim || '')}.
                    </Paragraph>
                    {errors.reservationTime && <Paragraph style={styles.errorText}>{errors.reservationTime}</Paragraph>}
                    {/* Campo Número de Pessoas */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 0 }}>
                        <PaperInput
                            mode="outlined"
                            style={[styles.input, { flex: 1 }]}
                            label="Número de Pessoas"
                            value={numeroPessoas}
                            onChangeText={text => {
                                let onlyNumbers = text.replace(/[^0-9]/g, '');
                                if (mesa && Number(onlyNumbers) > mesa.capacidade) {
                                    onlyNumbers = mesa.capacidade.toString();
                                }
                                setNumeroPessoas(onlyNumbers);
                            }}
                            placeholder="Número de Pessoas"
                            left={<PaperInput.Icon icon="account-group" color="#ff7a00" />}
                            keyboardType="number-pad"
                            error={!!errors.numeroPessoas}
                            theme={{ colors: { primary: '#ff7a00', background: '#fffaf5' } }}
                            outlineColor="#ffb366"
                            activeOutlineColor="#ff7a00"
                            onFocus={() => setFocusedField('pessoas')}
                            onBlur={() => setFocusedField(null)}
                            accessibilityLabel="Campo de número de pessoas"
                            returnKeyType="next"
                        />
                        {mesa && (
                            <Paragraph style={styles.maxLabel}>(máx = {mesa.capacidade})</Paragraph>
                        )}
                    </View>
                    {errors.numeroPessoas && <Paragraph style={styles.errorText}>{errors.numeroPessoas}</Paragraph>}
                    {/* Campo Observação */}
                    <PaperInput
                        mode="outlined"
                        style={[styles.input, { textAlign: 'left' }]}
                        label="Observação (opcional)"
                        value={observacao}
                        onChangeText={setObservacao}
                        placeholder="Observação (opcional)"
                        left={<PaperInput.Icon icon="note-text-outline" color="#ff7a00" />}
                        multiline
                        numberOfLines={2}
                        theme={{ colors: { primary: '#ff7a00', background: '#fffaf5' } }}
                        outlineColor="#ffb366"
                        activeOutlineColor="#ff7a00"
                        onFocus={() => setFocusedField('obs')}
                        onBlur={() => setFocusedField(null)}
                        accessibilityLabel="Campo de observação da reserva"
                        returnKeyType="done"
                        contentStyle={{ textAlign: 'left' }}
                    />
                    {/* Botão Reservar */}
                    <Button
                        mode="contained"
                        style={[styles.button, loading && { opacity: 0.7 }]}
                        onPress={handleReservation}
                        labelStyle={styles.buttonText}
                        loading={loading}
                        disabled={loading}
                        contentStyle={styles.buttonContent}
                        icon="check-circle-outline"
                        accessibilityLabel="Botão para confirmar reserva"
                        rippleColor="#fff"
                    >
                        Reservar
                    </Button>
                </View>
            </View>
        </ScrollView>
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
        fontSize: 30,
        fontWeight: '800',
        color: '#ff7a00',
        marginBottom: 24,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    formCard: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 28,
        padding: 28,
        shadowColor: '#ffb366',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.16,
        shadowRadius: 24,
        elevation: 8,
        marginBottom: 16,
        alignSelf: 'center',
    },
    label: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 5,
        color: '#ff7a00',
        letterSpacing: 0.2,
    },
    maxLabel: {
        fontSize: 15,
        color: '#ff7a00',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    input: {
        marginBottom: 16,
        backgroundColor: '#fffaf5',
        borderRadius: 18,
        fontSize: 16,
        borderWidth: 0,
        paddingLeft: 8,
        minHeight: 48,
        // Microinteração: leve escala ao focar
        transitionProperty: 'box-shadow, border-color, transform',
        transitionDuration: '120ms',
    },
    inputError: {
        borderColor: '#ff5252',
        backgroundColor: '#fff6f6',
        transform: [{ scale: 1.03 }],
        shadowColor: '#ff5252',
        shadowOpacity: 0.12,
        shadowRadius: 6,
    },
    inputFocused: {
        borderColor: '#ff7a00',
        shadowColor: '#ffb366',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 3,
        backgroundColor: '#fff7ee',
        transform: [{ scale: 1.02 }],
        transitionProperty: 'all',
        transitionDuration: '200ms',
    },
    button: {
        backgroundColor: '#43e97b',
        borderRadius: 18,
        marginTop: 18,
        width: '100%',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#ffb366',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 6,
        minHeight: 54,
        justifyContent: 'center',
        alignSelf: 'center',
        overflow: 'visible',
        transform: [{ scale: 1 }],
        transitionProperty: 'all',
        transitionDuration: '120ms',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    infoText: {
        fontSize: 14,
        color: '#888',
        marginBottom: 10,
    },
    errorText: {
        color: '#ff5252',
        fontSize: 13,
        marginBottom: 8,
        marginLeft: 2,
    },
    observacaoInput: {
        // Remove textAlign, pois o correto é usar contentStyle no PaperInput
    },
});

export default MakeReservation;