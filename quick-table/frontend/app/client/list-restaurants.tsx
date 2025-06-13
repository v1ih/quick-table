import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type Restaurant = {
    id: number;
    nome: string;
    descricao: string;
    localizacao: string;
    telefone?: string;
    horarioInicio?: string;
    horarioFim?: string;
    imagens?: string[];
};

const getImageUrl = (img: string) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    return `${api.defaults.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, '') : ''}${img.startsWith('/') ? img : `/${img}`}`;
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

    const renderItem = ({ item }: { item: Restaurant }) => {
        const imagens = Array.isArray(item.imagens) ? item.imagens : [];
        const mainImage = imagens.length > 0 ? getImageUrl(imagens[0]) : null;
        return (
            <TouchableOpacity
                style={styles.restaurantCard}
                onPress={() => router.push(`/client/restaurant-details?id=${item.id}`)}
                activeOpacity={0.85}
            >
                <View style={styles.cardRow}>
                    {mainImage ? (
                        <Image source={{ uri: mainImage }} style={styles.restaurantImage} />
                    ) : (
                        <View style={styles.restaurantImagePlaceholder}>
                            <MaterialIcons name="restaurant" size={38} color="#ffb366" />
                        </View>
                    )}
                    <View style={styles.cardInfoWrapper}>
                        <Text style={styles.restaurantName}>{item.nome}</Text>
                        <Text style={styles.restaurantDescription} numberOfLines={2}>{item.descricao}</Text>
                        <Text style={styles.restaurantLocation} numberOfLines={1}>{item.localizacao}</Text>
                        {item.horarioInicio && item.horarioFim && (
                            <Text style={styles.restaurantHours}>Horário: {item.horarioInicio?.slice(0,5)} - {item.horarioFim?.slice(0,5)}</Text>
                        )}
                        {item.telefone && (
                            <Text style={styles.restaurantPhone}>Tel: {item.telefone}</Text>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

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
                    contentContainerStyle={{ paddingBottom: 24 }}
                    showsVerticalScrollIndicator={false}
                    alwaysBounceVertical={true}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f4f5f6',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        textAlign: 'center',
        color: '#ff7a00',
        marginBottom: 10,
        letterSpacing: 0.5,
    },
    restaurantCard: {
        backgroundColor: '#fff',
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1.5,
        borderColor: '#ffb366',
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    restaurantImage: {
        width: 72,
        height: 72,
        borderRadius: 14,
        marginRight: 14,
        borderWidth: 1,
        borderColor: '#ffb366',
        backgroundColor: '#fffaf5',
        resizeMode: 'cover',
    },
    restaurantImagePlaceholder: {
        width: 72,
        height: 72,
        borderRadius: 14,
        marginRight: 14,
        backgroundColor: '#fffaf5',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ffb366',
    },
    cardInfoWrapper: {
        flex: 1,
        justifyContent: 'center',
    },
    restaurantName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ff7a00',
        marginBottom: 2,
    },
    restaurantDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    restaurantLocation: {
        fontSize: 14,
        color: '#333',
        marginBottom: 2,
    },
    restaurantHours: {
        fontSize: 13,
        color: '#ff7a00',
        marginBottom: 1,
    },
    restaurantPhone: {
        fontSize: 13,
        color: '#888',
    },
    noRestaurantsText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 24,
        color: '#777',
    },
});

export default ListRestaurants;