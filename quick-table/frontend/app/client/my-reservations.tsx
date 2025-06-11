import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, BackHandler, FlatList, Text } from 'react-native';
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

    const getStatusColor = (status?: string, background = false) => {
        switch ((status || '').toLowerCase()) {
            case 'cancelada':
                return background ? '#ffeaea' : '#ff3b30';
            case 'confirmada':
                return background ? '#eaffea' : '#4caf50';
            case 'pendente':
                return background ? '#fff8e1' : '#ffb300';
            default:
                return background ? '#e3e3e3' : '#22223b';
        }
    };

    const renderItem = ({ item }: { item: Reservation }) => (
        <Card style={styles.reservationItem}>
            <Card.Content>
                <Paragraph style={styles.restaurantName}>{item.mesa?.restaurante?.nome || '-'}</Paragraph>
                <Paragraph style={styles.reservationText}>
                    <Text style={styles.label}>Mesa:</Text> {item.mesa?.numero || '-'} - {item.mesa?.descricao || '-'}
                </Paragraph>
                <Paragraph style={styles.reservationText}>
                    <Text style={styles.label}>Data:</Text> {new Date(item.dataHora).toLocaleDateString('pt-BR')}
                </Paragraph>
                <Paragraph style={styles.reservationText}>
                    <Text style={styles.label}>Horário:</Text> {new Date(item.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </Paragraph>
                <Paragraph style={styles.reservationText}>
                    <Text style={styles.label}>Pessoas:</Text> {item.numeroPessoas}
                </Paragraph>
                {item.observacao && (
                    <Paragraph style={styles.reservationText}>
                        <Text style={styles.label}>Observação:</Text> {item.observacao}
                    </Paragraph>
                )}
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status, true) }]}>
                    <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}>
                        {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Ativa'}
                    </Text>
                </View>
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
        backgroundColor: '#f9f9fb',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
        color: '#22223b',
        letterSpacing: 1,
    },
    reservationItem: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 18,
        padding: 20,
        // Sombra para Android e iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 0,
    },
    reservationText: {
        fontSize: 16,
        color: '#22223b',
        marginBottom: 4,
    },
    noReservationsText: {
        fontSize: 17,
        textAlign: 'center',
        marginTop: 32,
        color: '#888',
    },
    cancelButton: {
        backgroundColor: '#ff7a00',
        paddingVertical: 12,
        borderRadius: 18,
        alignItems: 'center',
        marginTop: 16,
        elevation: 2,
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    restaurantName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4A44C6',
        marginBottom: 6,
    },
    label: {
        fontWeight: 'bold',
        color: '#22223b',
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 10,
        marginBottom: 4,
    },
    statusBadgeText: {
        fontWeight: 'bold',
        fontSize: 15,
        letterSpacing: 1,
    },
});

export default MyReservations;