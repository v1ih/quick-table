import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, BackHandler, TextInput, Keyboard } from 'react-native';
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
    notaMedia?: number | string | null;
};

const getImageUrl = (img: string) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    return `${api.defaults.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, '') : ''}${img.startsWith('/') ? img : `/${img}`}`;
};

const ListRestaurants = () => {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
    const router = useRouter();

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await api.get('/restaurantes');
                const restos = response.data as Restaurant[];
                setRestaurants(restos);
                setFilteredRestaurants(restos);
            } catch (error) {
                Alert.alert('Erro', 'Não foi possível carregar os restaurantes.');
            }
        };
        fetchRestaurants();
    }, []);

    // Buscar favoritos do usuário (ids)
    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const res = await api.get('/favoritos');
                const favs = Array.isArray(res.data) ? res.data.map((r: any) => r.id) : [];
                setFavoriteIds(new Set(favs));
            } catch (err) {
                // não crítico
            }
        };
        fetchFavorites();
    }, []);

    useEffect(() => {
        if (!searchQuery) {
            setFilteredRestaurants(restaurants);
            return;
        }
        const q = searchQuery.toLowerCase();
        const filtered = restaurants.filter(r => {
            const nome = r.nome ? String(r.nome).toLowerCase() : '';
            const descricao = r.descricao ? String(r.descricao).toLowerCase() : '';
            const localizacao = r.localizacao ? String(r.localizacao).toLowerCase() : '';
            return nome.includes(q) || descricao.includes(q) || localizacao.includes(q);
        });
        setFilteredRestaurants(filtered);
    }, [searchQuery, restaurants]);

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
                        <View style={styles.rowTopRight} />
                        <TouchableOpacity
                            style={styles.favoriteButton}
                            onPress={async () => {
                                try {
                                    const isFav = favoriteIds.has(item.id);
                                    if (isFav) {
                                        await api.delete(`/favoritos/${item.id}`);
                                        const copy = new Set(favoriteIds);
                                        copy.delete(item.id);
                                        setFavoriteIds(copy);
                                    } else {
                                        await api.post('/favoritos', { restauranteId: item.id });
                                        const copy = new Set(favoriteIds);
                                        copy.add(item.id);
                                        setFavoriteIds(copy);
                                    }
                                } catch (err) {
                                    Alert.alert('Erro', 'Não foi possível atualizar favorito.');
                                }
                            }}
                        >
                            <MaterialIcons name={favoriteIds.has(item.id) ? 'favorite' : 'favorite-border'} size={20} color={favoriteIds.has(item.id) ? '#ff4d6d' : '#666'} />
                        </TouchableOpacity>
                        <View style={styles.ratingRow}>
                            <MaterialIcons name="star" size={16} color="#ffcc33" />
                            {(() => {
                                const raw = (item as any).notaMedia;
                                const v = raw === null || raw === undefined ? null : Number(raw);
                                return (
                                    <Text style={styles.ratingText}>{v != null && !Number.isNaN(v) ? v.toFixed(1) : '—'}</Text>
                                );
                            })()}
                        </View>
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
            <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    placeholder="Buscar restaurantes..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={styles.searchInput}
                    returnKeyType="search"
                    onSubmitEditing={() => Keyboard.dismiss()}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                        <MaterialIcons name="close" size={18} color="#666" />
                    </TouchableOpacity>
                )}
            </View>
            {restaurants.length === 0 ? (
                <Text style={styles.noRestaurantsText}>Nenhum restaurante disponível.</Text>
            ) : filteredRestaurants.length === 0 ? (
                <Text style={styles.noRestaurantsText}>Nenhum restaurante encontrado.</Text>
            ) : (
                <FlatList
                    data={filteredRestaurants}
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#333',
        paddingVertical: 2,
    },
    clearButton: {
        marginLeft: 8,
        padding: 4,
        borderRadius: 8,
    },
    rowTopRight: {
        position: 'absolute',
        right: 8,
        top: 8,
    },
    favoriteButton: {
        position: 'absolute',
        right: 8,
        top: 6,
        padding: 6,
        borderRadius: 20,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 2,
    },
    ratingText: {
        marginLeft: 6,
        fontSize: 13,
        color: '#333',
        fontWeight: '600',
    },
});

export default ListRestaurants;