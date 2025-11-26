import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Image, BackHandler, TextInput, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { MaterialIcons } from '@expo/vector-icons';

const MyFavorites = () => {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [filteredFavorites, setFilteredFavorites] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const res = await api.get('/favoritos');
                setFavorites(res.data || []);
                setFilteredFavorites(res.data || []);
            } catch (err) {
                Alert.alert('Erro', 'Não foi possível carregar favoritos.');
            }
        };
        fetchFavorites();
    }, []);

    useEffect(() => {
        if (!searchQuery) {
            setFilteredFavorites(favorites);
            return;
        }
        const q = searchQuery.toLowerCase();
        const filtered = favorites.filter((r: any) => {
            const nome = r.nome ? String(r.nome).toLowerCase() : '';
            const descricao = r.descricao ? String(r.descricao).toLowerCase() : '';
            const localizacao = r.localizacao ? String(r.localizacao).toLowerCase() : '';
            return nome.includes(q) || descricao.includes(q) || localizacao.includes(q);
        });
        setFilteredFavorites(filtered);
    }, [searchQuery, favorites]);

    const handleRemoveFavorite = async (restauranteId: number) => {
        try {
            await api.delete(`/favoritos/${restauranteId}`);
            const updated = favorites.filter(f => f.id !== restauranteId);
            setFavorites(updated);
            showToast('Removido dos favoritos');
        } catch (err) {
            showToast('Erro ao remover dos favoritos');
        }
    };

    const showToast = (message: string, duration = 2000) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), duration);
    };

    useEffect(() => {
        const handleBackToHome = () => {
            router.replace('/common/home');
            return true;
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackToHome);
        return () => backHandler.remove();
    }, []);

    const renderItem = ({ item }: { item: any }) => {
        const imagens = Array.isArray(item.imagens) ? item.imagens : [];
        const mainImage = imagens.length > 0 ? `${api.defaults.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, '') : ''}${imagens[0].startsWith('/') ? imagens[0] : `/${imagens[0]}`}` : null;
        return (
            <TouchableOpacity style={styles.restaurantCard} onPress={() => router.push(`/client/restaurant-details?id=${item.id}`)}>
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
                    <TouchableOpacity style={styles.favoriteButton} onPress={() => handleRemoveFavorite(item.id)}>
                        <MaterialIcons name="favorite" size={22} color="#ff4d6d" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.titleRow}>
                <Text style={styles.title}>Meus Favoritos</Text>
                <Text style={styles.count}>{favorites.length}</Text>
            </View>
            <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    placeholder="Buscar favoritos..."
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
            {filteredFavorites.length === 0 ? (
                <Text style={styles.noRestaurantsText}>Nenhum favorito ainda.</Text>
            ) : (
                <FlatList
                    data={filteredFavorites}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 24 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
            {toastMessage ? <Toast message={toastMessage} /> : null}
        </View>
    );
};

// Toast UI
const Toast = ({ message }: { message: string }) => (
    <View style={toastStyles.container} pointerEvents="none">
        <View style={toastStyles.bubble}>
            <Text style={toastStyles.text}>{message}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f4f5f6' },
    title: { fontSize: 28, fontWeight: '800', textAlign: 'center', color: '#ff7a00', marginBottom: 10 },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    count: { marginLeft: 8, backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, fontWeight: '700', color: '#ff7a00' },
    restaurantCard: { backgroundColor: '#fff', borderRadius: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 16, padding: 10, borderWidth: 1.5, borderColor: '#ffb366' },
    cardRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    restaurantImage: { width: 72, height: 72, borderRadius: 14, marginRight: 14 },
    restaurantImagePlaceholder: { width: 72, height: 72, borderRadius: 14, marginRight: 14, backgroundColor: '#fffaf5', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ffb366' },
    cardInfoWrapper: { flex: 1, justifyContent: 'center' },
    restaurantName: { fontSize: 18, fontWeight: 'bold', color: '#ff7a00', marginBottom: 2 },
    restaurantDescription: { fontSize: 14, color: '#666', marginBottom: 2 },
    restaurantLocation: { fontSize: 14, color: '#333', marginBottom: 2 },
    restaurantHours: { fontSize: 13, color: '#ff7a00', marginBottom: 1 },
    restaurantPhone: { fontSize: 13, color: '#888' },
    favoriteButton: { position: 'absolute', right: 10, top: 18, padding: 6 },
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
    noRestaurantsText: { fontSize: 16, textAlign: 'center', marginTop: 24, color: '#777' },
});

const toastStyles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    bubble: {
        backgroundColor: 'rgba(0,0,0,0.85)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        maxWidth: '90%',
    },
    text: {
        color: '#fff',
        fontSize: 14,
    },
});

export default MyFavorites;
