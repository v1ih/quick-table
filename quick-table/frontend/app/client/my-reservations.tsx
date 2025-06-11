import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, BackHandler, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button, Title, Paragraph } from 'react-native-paper';
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
        <Card style={styles.reservationItem}>
            <Card.Content>
                <Paragraph style={styles.reservationText}>Restaurante: {item.mesa?.restaurante?.nome || '-'}</Paragraph>
                <Paragraph style={styles.reservationText}>Mesa: {item.mesa?.numero || '-'} - {item.mesa?.descricao || '-'}</Paragraph>
                <Paragraph style={styles.reservationText}>Data: {new Date(item.dataHora).toLocaleDateString()}</Paragraph>
                <Paragraph style={styles.reservationText}>Horário: {new Date(item.dataHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Paragraph>
                <Paragraph style={styles.reservationText}>Pessoas: {item.numeroPessoas}</Paragraph>
                {item.observacao && <Paragraph style={styles.reservationText}>Observação: {item.observacao}</Paragraph>}
                <Paragraph style={styles.reservationText}>Status: {item.status || 'Ativa'}</Paragraph>
                {item.status?.toLowerCase() !== 'cancelada' && (
                    <Button
                        mode="contained"
                        style={styles.cancelButton}
                        onPress={() => handleCancelReservation(item.id)}
                        labelStyle={styles.cancelButtonText}
                    >
                        Cancelar Reserva
                    </Button>
                )}
            </Card.Content>
        </Card>
    );

    return (
        <View style={styles.container}>
            <Title style={styles.title}>Minhas Reservas</Title>
            {reservations.length === 0 ? (
                <Paragraph style={styles.noReservationsText}>Você não possui reservas.</Paragraph>
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