import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, BackHandler, FlatList, Dimensions, Image, TouchableOpacity, TextInput, Keyboard, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Title, Button, Paragraph, Card } from 'react-native-paper';
import api from '../../services/api';
import { ThemedText } from '../../components/ThemedText';
import Carousel from 'react-native-reanimated-carousel';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

type Table = {
    id: number;
    numero: string;
    capacidade: string;
    descricao: string;
    disponivel: boolean;
    imagens?: string[];
};

const ManageTables = () => {
    const [tables, setTables] = useState<Table[]>([]);
    const [activeIndexes, setActiveIndexes] = useState<{ [id: number]: number }>({});
    const statusOptions = [
        { label: 'Todas', value: 'all', color: '#ff7a00', icon: 'table-furniture' },
        { label: 'Disponíveis', value: 'available', color: '#4caf50', icon: 'check-circle' },
        { label: 'Indisponíveis', value: 'unavailable', color: '#ff3b30', icon: 'close-circle' },
    ];
    const [statusFilter, setStatusFilter] = useState('all');
    const [capacityFilter, setCapacityFilter] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const response = await api.get('/mesas');
                setTables(response.data);
            } catch (error) {
                Alert.alert('Erro', 'Não foi possível carregar as mesas.');
            }
        };
        fetchTables();
    }, []);

    useEffect(() => {
        const backAction = () => {
            router.replace('/common/home');
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, []);

    const handleDeleteTable = async (id: number) => {
        Alert.alert(
            'Confirmação',
            'Tem certeza de que deseja excluir esta mesa?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/mesas/${id}`);
                            Alert.alert('Sucesso', 'Mesa excluída com sucesso!');
                            const response = await api.get('/mesas'); // Recarregar as mesas
                            setTables(response.data);
                        } catch (error) {
                            Alert.alert('Erro', 'Erro ao excluir mesa.');
                        }
                    },
                },
            ]
        );
    };

    const handleEditTable = (id: number) => {
        router.push(`/restaurant/edit-table?id=${id}`);
    };

    const handleAddTable = () => {
        router.push('/restaurant/add-table');
    };

    // Filtro aplicado aos dados
    const filteredTables = tables.filter((table) => {
        if (statusFilter === 'available' && !table.disponivel) return false;
        if (statusFilter === 'unavailable' && table.disponivel) return false;
        if (capacityFilter && table.capacidade !== capacityFilter) return false;
        return true;
    });

    const renderItem = ({ item }: { item: Table }) => {
        const imagens = Array.isArray(item.imagens) ? item.imagens : [];
        const activeIndex = activeIndexes[item.id] || 0;
        const setActiveIndex = (idx: number) => setActiveIndexes(prev => ({ ...prev, [item.id]: idx }));
        const hasImages = imagens.length > 0;
        return (
          <View style={styles.card}>
            {/* Carrossel de imagens: uma por vez, setas e dots */}
            {hasImages && (
              <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center', width: '100%', height: 160, backgroundColor: '#fffaf5' }}>
                <Image
                  source={{ uri: typeof imagens[activeIndex] === 'string' ? (imagens[activeIndex].startsWith('http') ? imagens[activeIndex] : `${api.defaults.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, '') : ''}${imagens[activeIndex].startsWith('/') ? imagens[activeIndex] : `/${imagens[activeIndex]}`}`) : '' }}
                  style={styles.cardImage}
                />
                {/* Seta esquerda */}
                {imagens.length > 1 && activeIndex > 0 && (
                  <TouchableOpacity
                    style={{ position: 'absolute', left: 8, top: '50%', transform: [{ translateY: -20 }], backgroundColor: '#fff', borderRadius: 20, padding: 4, borderWidth: 1, borderColor: '#ffb366', zIndex: 2 }}
                    onPress={() => setActiveIndex(activeIndex - 1)}
                    accessibilityLabel="Imagem anterior"
                  >
                    <MaterialIcons name="chevron-left" size={28} color="#ff7a00" />
                  </TouchableOpacity>
                )}
                {/* Seta direita */}
                {imagens.length > 1 && activeIndex < imagens.length - 1 && (
                  <TouchableOpacity
                    style={{ position: 'absolute', right: 8, top: '50%', transform: [{ translateY: -20 }], backgroundColor: '#fff', borderRadius: 20, padding: 4, borderWidth: 1, borderColor: '#ffb366', zIndex: 2 }}
                    onPress={() => setActiveIndex(activeIndex + 1)}
                    accessibilityLabel="Próxima imagem"
                  >
                    <MaterialIcons name="chevron-right" size={28} color="#ff7a00" />
                  </TouchableOpacity>
                )}
                {/* Dots de navegação */}
                {imagens.length > 1 && (
                  <View style={styles.carouselDotsWrapper}>
                    {imagens.map((_, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.dot, activeIndex === idx && styles.dotActive]}
                        onPress={() => setActiveIndex(idx)}
                        accessibilityLabel={`Selecionar imagem ${idx + 1}`}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <ThemedText style={styles.cardTitle}>Mesa {item.numero}</ThemedText>
                <View style={[
                  styles.statusBadge,
                  item.disponivel ? styles.statusAvailable : styles.statusUnavailable
                ]}>
                  <MaterialCommunityIcons
                    name={item.disponivel ? 'check-circle' : 'close-circle'}
                    size={16}
                    color={item.disponivel ? '#4caf50' : '#ff3b30'}
                  />
                  <ThemedText style={[
                    styles.statusText,
                    item.disponivel ? { color: '#4caf50' } : { color: '#ff3b30' }
                  ]}>
                    {item.disponivel ? 'Disponível' : 'Indisponível'}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={styles.cardInfo}><ThemedText style={styles.cardLabel}>Capacidade:</ThemedText> {item.capacidade}</ThemedText>
              <ThemedText style={styles.cardInfo}><ThemedText style={styles.cardLabel}>Descrição:</ThemedText> {item.descricao || 'Sem descrição'}</ThemedText>
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.editButton} onPress={() => handleEditTable(item.id)}>
                  <MaterialIcons name="edit" size={18} color="#fff" />
                  <ThemedText style={styles.actionText}>Editar</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteTable(item.id)}>
                  <MaterialIcons name="delete" size={18} color="#fff" />
                  <ThemedText style={styles.actionText}>Excluir</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
    };

    return (
        <View style={styles.container}>
            <Title style={styles.title}>Gerenciar Mesas</Title>
            <View style={styles.filtersWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersScroll}
                >
                    {statusOptions.map(opt => (
                        <TouchableOpacity
                            key={opt.value}
                            style={[
                                styles.filterButton,
                                statusFilter === opt.value && { backgroundColor: opt.color, borderColor: opt.color },
                            ]}
                            onPress={() => setStatusFilter(opt.value)}
                            activeOpacity={0.8}
                        >
                            <MaterialCommunityIcons
                                name={opt.icon as any}
                                size={20}
                                color={statusFilter === opt.value ? '#fff' : opt.color}
                                style={{ marginRight: 6 }}
                            />
                            <ThemedText
                                style={[
                                    styles.filterButtonText,
                                    statusFilter === opt.value && { color: '#fff' },
                                ]}
                            >
                                {opt.label}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                    <View style={styles.filterButton}>
                        <MaterialIcons name="people" size={20} color="#ff7a00" style={{ marginRight: 6 }} />
                        <TextInput
                            value={capacityFilter}
                            onChangeText={setCapacityFilter}
                            placeholder="Cap."
                            keyboardType="numeric"
                            style={styles.capacityTextInput}
                            maxLength={3}
                            selectionColor="#ff7a00"
                            underlineColorAndroid="transparent"
                            returnKeyType="done"
                            onSubmitEditing={Keyboard.dismiss}
                            placeholderTextColor="#ffb366"
                        />
                    </View>
                </ScrollView>
            </View>
            <Button
                mode="contained"
                style={styles.addButton}
                onPress={handleAddTable}
                labelStyle={styles.buttonText}
                icon={() => <MaterialIcons name="add" size={22} color="#fff" />}
            >
                Cadastrar Nova Mesa
            </Button>
            {filteredTables.length === 0 ? (
                <Paragraph style={styles.noTablesText}>Nenhuma mesa encontrada.</Paragraph>
            ) : (
                <FlatList
                    data={filteredTables}
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
    filtersWrapper: {
        marginBottom: 12,
        paddingVertical: 2,
    },
    filtersScroll: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 2,
        minHeight: 44,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#ffb366',
        marginRight: 10,
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: '#fff',
        minHeight: 40,
        minWidth: 110,
    },
    filterButtonText: {
        color: '#ff7a00',
        fontWeight: 'bold',
        fontSize: 16,
    },
    capacityInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fffaf5',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ffb366',
        paddingHorizontal: 8,
        marginLeft: 2,
        height: 38,
        minWidth: 60,
        justifyContent: 'center',
    },
    capacityTextInput: {
        width: 40,
        color: '#ff7a00',
        fontWeight: 'bold',
        fontSize: 16,
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 0,
        textAlign: 'center',
    },
    addButton: {
        backgroundColor: '#ff7a00',
        paddingVertical: 14,
        borderRadius: 18,
        alignItems: 'center',
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        shadowColor: '#ffb366',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 6,
        elevation: 2,
        marginTop: 0,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1.5,
        borderColor: '#ffb366',
        overflow: 'hidden',
    },
    cardCarousel: {
        width: '100%',
        height: 160,
        backgroundColor: '#fffaf5',
    },
    cardImage: {
        width: 260,
        height: 160,
        borderRadius: 16,
        marginRight: 8,
        resizeMode: 'cover',
        borderWidth: 1,
        borderColor: '#ffb366',
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ff7a00',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        marginLeft: 8,
    },
    statusAvailable: {
        backgroundColor: '#eaffea',
        borderColor: '#4caf50',
    },
    statusUnavailable: {
        backgroundColor: '#ffeaea',
        borderColor: '#ff3b30',
    },
    statusText: {
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: 4,
    },
    cardInfo: {
        fontSize: 15,
        color: '#22223b',
        marginBottom: 2,
    },
    cardLabel: {
        fontWeight: 'bold',
        color: '#ff7a00',
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        gap: 8,
    },
    editButton: {
        backgroundColor: '#ffb366',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        flex: 1,
        marginRight: 4,
        justifyContent: 'center',
    },
    deleteButton: {
        backgroundColor: '#FF4C4C',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        flex: 1,
        marginLeft: 4,
        justifyContent: 'center',
    },
    actionText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 6,
        fontSize: 15,
    },
    noTablesText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 24,
        color: '#777',
    },
    carouselDotsWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 2,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ffb366',
        marginHorizontal: 2,
        opacity: 0.5,
    },
    dotActive: {
        backgroundColor: '#ff7a00',
        opacity: 1,
    },
    carousel: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default ManageTables;