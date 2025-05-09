import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api';

type Reservation = {
    id: number;
    dataHora: string;
    status?: string;
    numeroPessoas: number;
    observacao?: string;
    mesa?: {
        numero: string;
        descricao: string;
        restaurante?: {
            nome: string;
        };
    };
};

const MyReservations = () => {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const response = await api.get('/reservas');
                setReservations(response.data.map((reservation: any) => ({
                    ...reservation,
                    mesa: reservation.Mesa ? {
                        numero: reservation.Mesa.numero || '-',
                        descricao: reservation.Mesa.descricao || '-',
                        restaurante: reservation.Mesa.Restaurante ? {
                            nome: reservation.Mesa.Restaurante.nome || '-',
                        } : undefined,
                    } : undefined,
                })));
            } catch (error) {
                Alert.alert('Erro', 'Não foi possível carregar suas reservas.');
            }
        };

        fetchReservations();
    }, []);

    useEffect(() => {
        const handleBackToHome = () => {
            router.replace('/common/home');
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackToHome);

        return () => backHandler.remove();
    }, []);

    const handleCancelReservation = async (id: number) => {
        try {
            await api.delete(`/reservas/${id}`);
            setReservations((prevReservations) =>
                prevReservations.map((reservation) =>
                    reservation.id === id
                        ? { ...reservation, status: 'Cancelada' }
                        : reservation
                )
            );
            Alert.alert('Sucesso', 'Reserva cancelada com sucesso.');
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível cancelar a reserva.');
        }
    };

    const renderItem = ({ item }: { item: Reservation }) => (
        <View style={styles.reservationItem}>
            <Text style={styles.reservationText}>Restaurante: {item.mesa?.restaurante?.nome || '-'}</Text>
            <Text style={styles.reservationText}>Mesa: {item.mesa?.numero || '-'} - {item.mesa?.descricao || '-'}</Text>
            <Text style={styles.reservationText}>Data: {new Date(item.dataHora).toLocaleDateString()}</Text>
            <Text style={styles.reservationText}>Horário: {new Date(item.dataHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            <Text style={styles.reservationText}>Pessoas: {item.numeroPessoas}</Text>
            {item.observacao && <Text style={styles.reservationText}>Observação: {item.observacao}</Text>}
            <Text style={styles.reservationText}>Status: {item.status || 'Ativa'}</Text>
            {item.status?.toLowerCase() !== 'cancelada' && (
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => handleCancelReservation(item.id)}
                >
                    <Text style={styles.cancelButtonText}>Cancelar Reserva</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Minhas Reservas</Text>
            {reservations.length === 0 ? (
                <Text style={styles.noReservationsText}>Você não possui reservas.</Text>
            ) : (
                <FlatList
                    data={reservations}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                />
            )}
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
    reservationItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 10,
    },
    reservationText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    noReservationsText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        color: '#666',
    },
    cancelButton: {
        backgroundColor: '#FF0000',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default MyReservations;