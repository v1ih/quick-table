import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, FlatList, TouchableOpacity, BackHandler } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../../services/api';

type RestaurantDetails = {
    id: number;
    nome: string;
    descricao: string;
    localizacao: string;
    telefone: string;
    horarioInicio: string;
    horarioFim: string;
};

type Table = {
    id: number;
    numero: string;
    capacidade: string;
    disponivel: boolean;
    descricao?: string;
};

const RestaurantDetails = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [restaurant, setRestaurant] = useState<RestaurantDetails | null>(null);
    const [tables, setTables] = useState<Table[]>([]);

    const handleBackToList = () => {
        router.replace('/client/list-restaurants');
    };

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            handleBackToList();
            return true;
        });

        return () => backHandler.remove();
    }, []);

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

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const response = await api.get(`/mesas/disponiveis?restauranteId=${id}`); // Atualiza para usar a rota correta
                setTables(response.data);
            } catch (error) {
                Alert.alert('Erro', 'Não foi possível carregar as mesas disponíveis.');
            }
        };

        if (id) {
            fetchTables();
        }
    }, [id]);

    const navigateToMakeReservation = (mesaId: number) => {
        router.push(`/client/make-reservation?id=${id}&mesaId=${mesaId}`);
    };

    if (!restaurant) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Carregando...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{restaurant.nome}</Text>
            <Text style={styles.description}>{restaurant.descricao}</Text>
            <Text style={styles.info}>Localização: {restaurant.localizacao}</Text>
            <Text style={styles.info}>Telefone: {restaurant.telefone}</Text>
            <Text style={styles.info}>Horário: {restaurant.horarioInicio} - {restaurant.horarioFim}</Text>
            <Text style={styles.subtitle}>Mesas Disponíveis</Text>
            {tables.length === 0 ? (
                <Text style={styles.noTablesText}>Nenhuma mesa disponível.</Text>
            ) : (
                <FlatList
                    data={tables}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.tableItem}>
                            <Text style={styles.tableText}>Mesa {item.numero} - Capacidade: {item.capacidade}</Text>
                            <Text style={styles.tableText}>Descrição: {item.descricao || 'Sem descrição disponível'}</Text>
                            {item.disponivel ? (
                                <TouchableOpacity
                                    style={styles.reserveButton}
                                    onPress={() => navigateToMakeReservation(item.id)}
                                >
                                    <Text style={styles.buttonText}>Reservar</Text>
                                </TouchableOpacity>
                            ) : (
                                <Text style={styles.unavailableText}>Indisponível</Text>
                            )}
                        </View>
                    )}
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
        marginBottom: 10,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    info: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
    },
    loadingText: {
        fontSize: 18,
        textAlign: 'center',
        color: '#666',
    },
    subtitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        textAlign: 'center',
    },
    noTablesText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    tableItem: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    tableText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    reserveButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    unavailableText: {
        fontSize: 16,
        color: '#FF5722',
        fontWeight: 'bold',
    },
});

export default RestaurantDetails;