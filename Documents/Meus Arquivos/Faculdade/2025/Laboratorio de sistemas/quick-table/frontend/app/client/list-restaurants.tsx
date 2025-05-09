import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api';

type Restaurant = {
    id: number;
    nome: string;
    descricao: string;
    localizacao: string;
};

const ListRestaurants = () => {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await api.get('/restaurantes');
                setRestaurants(response.data);
            } catch (error) {
                Alert.alert('Erro', 'Não foi possível carregar os restaurantes.');
            }
        };

        fetchRestaurants();
    }, []);

    useEffect(() => {
        const handleBackToHome = () => {
            router.replace('/common/home');
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackToHome);

        return () => backHandler.remove();
    }, []);

    const renderItem = ({ item }: { item: Restaurant }) => (
        <TouchableOpacity
            style={styles.restaurantItem}
            onPress={() => router.push(`/client/restaurant-details?id=${item.id}`)}
        >
            <Text style={styles.restaurantName}>{item.nome}</Text>
            <Text style={styles.restaurantDescription}>{item.descricao}</Text>
            <Text style={styles.restaurantLocation}>{item.localizacao}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Restaurantes</Text>
            {restaurants.length === 0 ? (
                <Text style={styles.noRestaurantsText}>Nenhum restaurante disponível.</Text>
            ) : (
                <FlatList
                    data={restaurants}
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
    restaurantItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 10,
    },
    restaurantName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    restaurantDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    restaurantLocation: {
        fontSize: 14,
        color: '#333',
    },
    noRestaurantsText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        color: '#666',
    },
});

export default ListRestaurants;