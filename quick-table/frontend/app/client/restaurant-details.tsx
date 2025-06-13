import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, FlatList, BackHandler, Image, Dimensions, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card, Button, Title, Paragraph } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../services/api';

type RestaurantDetails = {
    id: number;
    nome: string;
    descricao: string;
    localizacao: string;
    telefone: string;
    horarioInicio: string;
    horarioFim: string;
    imagens?: string[];
};

type Table = {
    id: number;
    numero: string;
    capacidade: string;
    disponivel: boolean;
    descricao?: string;
    imagens?: string[];
};

const getImageUrl = (img: string) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    return `${api.defaults.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, '') : ''}${img.startsWith('/') ? img : `/${img}`}`;
};

const RestaurantDetails = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [restaurant, setRestaurant] = useState<RestaurantDetails | null>(null);
    const [tables, setTables] = useState<Table[]>([]);
    const [activeImage, setActiveImage] = useState(0);
    const [mesaActiveImages, setMesaActiveImages] = useState<{ [id: number]: number }>({});
    const screenWidth = Dimensions.get('window').width;

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
                <Paragraph style={styles.loadingText}>Carregando...</Paragraph>
            </View>
        );
    }

    const imagensRestaurante = Array.isArray(restaurant.imagens) ? restaurant.imagens : [];

    // Header do FlatList: carrossel + info restaurante + título mesas
    const renderHeader = () => (
        <View>
            <Title style={styles.pageTitle}>Detalhes do Restaurante</Title>
            {imagensRestaurante.length > 0 && (
                <View style={styles.carouselWrapper}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={(e: any) => {
                            const idx = Math.round(e.nativeEvent.contentOffset.x / (screenWidth - 32));
                            setActiveImage(idx);
                        }}
                        scrollEventThrottle={16}
                        style={{ width: '100%' }}
                        contentContainerStyle={{ alignItems: 'center' }}
                    >
                        {imagensRestaurante.map((img, idx) => (
                            <Image
                                key={idx}
                                source={{ uri: getImageUrl(img) }}
                                style={styles.carouselImageLarge}
                            />
                        ))}
                    </ScrollView>
                    <View style={styles.carouselDotsWrapper}>
                        {imagensRestaurante.map((_, idx) => (
                            <View
                                key={idx}
                                style={[styles.dot, activeImage === idx && styles.dotActive]}
                            />
                        ))}
                    </View>
                </View>
            )}
            <Card style={styles.restaurantInfoCard}>
                <Card.Content>
                    <Title style={styles.title}>{restaurant.nome}</Title>
                    <Paragraph style={styles.description}>{restaurant.descricao}</Paragraph>
                    <Paragraph style={styles.info}><Paragraph style={styles.infoLabel}>Localização:</Paragraph> {restaurant.localizacao}</Paragraph>
                    <Paragraph style={styles.info}><Paragraph style={styles.infoLabel}>Telefone:</Paragraph> {restaurant.telefone}</Paragraph>
                    <Paragraph style={styles.info}><Paragraph style={styles.infoLabel}>Horário:</Paragraph> <Paragraph style={styles.infoHour}>{restaurant.horarioInicio.slice(0,5)} - {restaurant.horarioFim.slice(0,5)}</Paragraph></Paragraph>
                </Card.Content>
            </Card>
            <Title style={styles.subtitle}>Mesas Disponíveis</Title>
        </View>
    );

    return (
        <FlatList
            data={tables}
            keyExtractor={(item) => item.id.toString()}
            ListHeaderComponent={renderHeader}
            renderItem={({ item }) => {
                const imagensMesa = Array.isArray(item.imagens) ? item.imagens : [];
                const mesaActiveImage = mesaActiveImages[item.id] || 0;
                const setMesaActiveImage = (idx: number) => setMesaActiveImages(prev => ({ ...prev, [item.id]: idx }));
                const mesaImage = imagensMesa.length > 0 ? getImageUrl(imagensMesa[mesaActiveImage]) : null;
                return (
                    <Card style={styles.tableItemModernImproved}>
                        <Card.Content style={{ alignItems: 'center', paddingBottom: 24, paddingTop: 18 }}>
                            <View style={{ width: '100%', alignItems: 'center', position: 'relative', marginBottom: 10 }}>
                                {/* Carrossel de imagens da mesa */}
                                <View style={{ width: 220, height: 140, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                    {imagensMesa.length > 1 && (
                                        <Button
                                            style={[styles.mesaCarouselArrowLeftModernImproved, { left: -28, right: undefined }]}
                                            onPress={() => setMesaActiveImage(Math.max(mesaActiveImage - 1, 0))}
                                            compact
                                            contentStyle={{ alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <MaterialIcons name="chevron-left" size={28} color="#ff7a00" />
                                        </Button>
                                    )}
                                    {mesaImage ? (
                                        <Image source={{ uri: mesaImage }} style={[styles.mesaCarouselImageModernImproved, styles.mesaCarouselImageModernImprovedBorder, { marginHorizontal: 12 }]} />
                                    ) : (
                                        <View style={styles.tableImagePlaceholderModernImproved}>
                                            <MaterialIcons name="table-restaurant" size={56} color="#ffb366" />
                                        </View>
                                    )}
                                    {imagensMesa.length > 1 && (
                                        <Button
                                            style={[styles.mesaCarouselArrowRightModernImproved, { right: -28, left: undefined }]}
                                            onPress={() => setMesaActiveImage(Math.min(mesaActiveImage + 1, imagensMesa.length - 1))}
                                            compact
                                            contentStyle={{ alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <MaterialIcons name="chevron-right" size={28} color="#ff7a00" />
                                        </Button>
                                    )}
                                    {imagensMesa.length > 1 && (
                                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: 6, left: 0, right: 0 }}>
                                            {imagensMesa.map((_, idx) => (
                                                <View key={idx} style={[styles.dot, mesaActiveImage === idx && styles.dotActive]} />
                                            ))}
                                        </View>
                                    )}
                                </View>
                            </View>
                            {/* Título e badge */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                <Paragraph style={[styles.tableLabelModern, { fontSize: 20, marginRight: 10 }]}>Mesa {item.numero}</Paragraph>
                                <View style={[styles.badgeDisponibilidadeImproved, { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 16, backgroundColor: item.disponivel ? '#e8f5e9' : '#f5f5f5' }]}> 
                                    <MaterialIcons name={item.disponivel ? 'check-circle' : 'cancel'} size={18} color={item.disponivel ? '#4CAF50' : '#BDBDBD'} />
                                    <Paragraph style={{ color: item.disponivel ? '#388e3c' : '#BDBDBD', fontWeight: 'bold', fontSize: 14, marginLeft: 6 }}>{item.disponivel ? 'Disponível' : 'Indisponível'}</Paragraph>
                                </View>
                            </View>
                            {/* Capacidade e descrição */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                <MaterialIcons name="people" size={18} color="#ff7a00" style={{ marginRight: 4 }} />
                                <Paragraph style={{ fontSize: 15, color: '#333', fontWeight: '500' }}>Capacidade: {item.capacidade}</Paragraph>
                            </View>
                            <Paragraph style={{ fontSize: 15, color: '#666', marginBottom: 12, textAlign: 'center', minHeight: 18 }}>{item.descricao || 'Sem descrição disponível'}</Paragraph>
                            {/* Botão reservar */}
                            {item.disponivel && (
                                <Button
                                    mode="contained"
                                    style={{ backgroundColor: '#43e97b', paddingVertical: 14, borderRadius: 14, width: 180, alignSelf: 'center', elevation: 2 }}
                                    onPress={() => navigateToMakeReservation(item.id)}
                                    icon={() => <MaterialIcons name="event-available" size={20} color="#fff" style={{ marginRight: 2 }} />}
                                    labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}
                                >
                                    Reservar
                                </Button>
                            )}
                        </Card.Content>
                    </Card>
                );
            }}
            contentContainerStyle={{ padding: 16, paddingBottom: 24, backgroundColor: '#f4f5f6', flexGrow: 1 }}
            ListEmptyComponent={<Paragraph style={styles.noTablesText}>Nenhuma mesa disponível.</Paragraph>}
            showsVerticalScrollIndicator={false}
            alwaysBounceVertical={true}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 0,
        backgroundColor: '#f9f9fb',
    },
    carouselWrapper: {
        width: '100%',
        height: 240,
        marginBottom: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    carouselImage: {
        width: Dimensions.get('window').width - 32,
        height: 180,
        borderRadius: 16,
        marginRight: 0,
        resizeMode: 'cover',
        borderWidth: 1,
        borderColor: '#ffb366',
        backgroundColor: '#fffaf5',
    },
    carouselImageLarge: {
        width: Dimensions.get('window').width - 32,
        height: 220,
        borderRadius: 22,
        marginHorizontal: 4,
        resizeMode: 'cover',
        borderWidth: 0,
        backgroundColor: '#fff',
        shadowColor: '#ffb366',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.10,
        shadowRadius: 16,
        elevation: 5,
        alignSelf: 'center',
    },
    carouselDotsWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 2,
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: '#ffb366',
        marginHorizontal: 2,
        opacity: 0.3,
    },
    dotActive: {
        backgroundColor: '#ff7a00',
        opacity: 0.7,
    },
    restaurantInfoCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 18,
        padding: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1.5,
        borderColor: '#ffb366',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
        textAlign: 'center',
        color: '#22223b',
    },
    description: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
        textAlign: 'center',
    },
    info: {
        fontSize: 15,
        color: '#333',
        marginBottom: 4,
    },
    infoLabel: {
        color: '#ff7a00',
        fontWeight: 'bold',
    },
    infoHour: {
        color: '#4caf50',
        fontWeight: 'bold',
    },
    loadingText: {
        fontSize: 18,
        textAlign: 'center',
        color: '#666',
    },
    subtitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 10,
        textAlign: 'center',
        color: '#ff7a00', // laranja
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
        borderRadius: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1.5,
        borderColor: '#ffb366',
    },
    tableItemModern: {
        marginBottom: 28,
        padding: 0,
        backgroundColor: '#fff',
        borderRadius: 22,
        shadowColor: '#ffb366',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.10,
        shadowRadius: 16,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#ffe3c2',
        alignItems: 'center',
    },
    tableItemModernImproved: {
        marginBottom: 32,
        padding: 0,
        backgroundColor: '#fff',
        borderRadius: 28,
        shadowColor: '#ffb366',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.13,
        shadowRadius: 18,
        elevation: 6,
        borderWidth: 1.5,
        borderColor: '#ffe3c2',
        alignItems: 'center',
    },
    tableImage: {
        width: 56,
        height: 56,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ffb366',
        backgroundColor: '#fffaf5',
        resizeMode: 'cover',
    },
    tableImageLarge: {
        width: 72,
        height: 72,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#ffb366',
        backgroundColor: '#fffaf5',
        resizeMode: 'cover',
        marginBottom: 2,
    },
    tableImagePlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: '#fffaf5',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ffb366',
    },
    tableImagePlaceholderLarge: {
        width: 72,
        height: 72,
        borderRadius: 14,
        backgroundColor: '#fffaf5',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ffb366',
        marginBottom: 2,
    },
    tableImagePlaceholderModern: {
        width: 180,
        height: 120,
        borderRadius: 18,
        backgroundColor: '#fffaf5',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0,
        marginBottom: 0,
    },
    tableImagePlaceholderModernImproved: {
        width: 180,
        height: 120,
        borderRadius: 22,
        backgroundColor: '#fffaf5',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0,
        marginBottom: 0,
    },
    tableText: {
        fontSize: 15,
        color: '#333',
        marginBottom: 2,
    },
    tableLabel: {
        color: '#ff7a00',
        fontWeight: 'bold',
    },
    reserveButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    reserveButtonModern: {
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 6,
        width: 160,
        alignSelf: 'center',
        elevation: 2,
    },
    reserveButtonModernImproved: {
        backgroundColor: '#4CAF50',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 14,
        width: 180,
        alignSelf: 'center',
        elevation: 2,
    },
    reserveButtonModernImprovedGradient: {
        backgroundColor: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 14,
        width: 180,
        alignSelf: 'center',
        elevation: 3,
        shadowColor: '#43e97b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    unavailableText: {
        fontSize: 15,
        color: '#FF5722',
        fontWeight: 'bold',
    },
    mesaImageCarouselWrapper: {
        width: 110,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    mesaImageCarouselModernWrapper: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 6,
    },
    mesaImageCarouselModernWrapperImproved: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 0,
        marginBottom: 0,
        minHeight: 140,
    },
    mesaCarouselImage: {
        width: 100,
        height: 100,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#ffb366',
        backgroundColor: '#fffaf5',
        resizeMode: 'cover',
    },
    mesaCarouselImageModern: {
        width: 180,
        height: 120,
        borderRadius: 18,
        borderWidth: 0,
        backgroundColor: '#fff',
        resizeMode: 'cover',
        marginBottom: 0,
        shadowColor: '#ffb366',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    mesaCarouselImageModernImproved: {
        width: 180,
        height: 120,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: '#ffb366',
        backgroundColor: '#fff',
        resizeMode: 'cover',
        marginBottom: 0,
        shadowColor: '#ffb366',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 10,
        elevation: 3,
    },
    mesaCarouselImageModernImprovedBorder: {
        borderWidth: 3,
        borderColor: '#ff7a00',
    },
    mesaCarouselArrowLeft: {
        position: 'absolute',
        left: -12,
        top: '50%',
        transform: [{ translateY: -14 }],
        zIndex: 2,
        minWidth: 0,
        padding: 0,
        backgroundColor: '#fff',
        borderRadius: 16,
        elevation: 2,
    },
    mesaCarouselArrowLeftModern: {
        position: 'absolute',
        left: 8,
        top: '50%',
        transform: [{ translateY: -18 }],
        zIndex: 2,
        minWidth: 0,
        padding: 0,
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 20,
        elevation: 2,
        opacity: 0.9,
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mesaCarouselArrowLeftModernImproved: {
        position: 'absolute',
        left: -36,
        top: '50%',
        transform: [{ translateY: -18 }],
        zIndex: 2,
        minWidth: 0,
        padding: 0,
        backgroundColor: '#fff',
        borderRadius: 20,
        elevation: 2,
        opacity: 1,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#ff7a00',
    },
    mesaCarouselArrowLeftModernImprovedWrapper: {
        position: 'absolute',
        left: -36,
        top: '50%',
        transform: [{ translateY: -20 }],
        zIndex: 2,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mesaCarouselArrowRight: {
        position: 'absolute',
        right: -12,
        top: '50%',
        transform: [{ translateY: -14 }],
        zIndex: 2,
        minWidth: 0,
        padding: 0,
        backgroundColor: '#fff',
        borderRadius: 16,
        elevation: 2,
    },
    mesaCarouselArrowRightModern: {
        position: 'absolute',
        right: 8,
        top: '50%',
        transform: [{ translateY: -18 }],
        zIndex: 2,
        minWidth: 0,
        padding: 0,
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 20,
        elevation: 2,
        opacity: 0.9,
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mesaCarouselArrowRightModernImproved: {
        position: 'absolute',
        right: -36,
        top: '50%',
        transform: [{ translateY: -18 }],
        zIndex: 2,
        minWidth: 0,
        padding: 0,
        backgroundColor: '#fff',
        borderRadius: 20,
        elevation: 2,
        opacity: 1,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#ff7a00',
    },
    mesaCarouselArrowRightModernImprovedWrapper: {
        position: 'absolute',
        right: -36,
        top: '50%',
        transform: [{ translateY: -20 }],
        zIndex: 2,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mesaCarouselDotsWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 2,
    },
    mesaCarouselDotsModernWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 2,
    },
    mesaCarouselDotsModernWrapperImproved: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 2,
    },
    mesaCarouselDotsModernWrapperImprovedCentered: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 2,
        width: '100%',
        position: 'absolute',
        left: 0,
        bottom: -18,
    },
    tableLabelModern: {
        color: '#ff7a00',
        fontWeight: 'bold',
        fontSize: 18,
        marginRight: 8,
    },
    badgeDisponibilidade: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f4f5f6',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 4,
    },
    badgeDisponibilidadeImproved: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f6f6f6',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 3,
        marginLeft: 8,
        shadowColor: '#ffb366',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 1,
    },
    badgeDisponibilidadeText: {
        fontSize: 13,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    tableCapacityModern: {
        fontSize: 15,
        color: '#333',
        marginLeft: 2,
    },
    tableDescriptionModern: {
        fontSize: 14,
        color: '#888',
        marginTop: 2,
        marginBottom: 8,
        textAlign: 'center',
    },
    tableDescriptionModernDark: {
        fontSize: 14,
        color: '#444',
        marginTop: 2,
        marginBottom: 8,
        textAlign: 'center',
    },
    pageTitle: {
        fontSize: 30,
        fontWeight: '800',
        color: '#ff7a00',
        marginBottom: 16,
        marginTop: 18,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
});

export default RestaurantDetails;