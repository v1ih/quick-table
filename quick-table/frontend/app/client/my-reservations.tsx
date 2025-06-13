import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, BackHandler, FlatList, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button, Title, Paragraph } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
    avaliacaoFeita?: boolean; // Adicionado para controle do botão de avaliação
};

const statusOptions = [
  { label: 'Todas', value: 'todas' },
  { label: 'Pendente', value: 'pendente' },
  { label: 'Confirmada', value: 'confirmada' },
  { label: 'Concluída', value: 'concluida' },
  { label: 'Cancelada', value: 'cancelada' },
];

const MyReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filter, setFilter] = useState('todas');
  const router = useRouter();

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await api.get('/reservas');
        // Para cada reserva concluída, verifica se já existe avaliação
        const reservas = await Promise.all(response.data.map(async (reservation: any) => {
          let avaliacaoFeita = false;
          if (reservation.status?.toLowerCase() === 'concluida') {
            try {
              // Busca avaliação para a reserva
              const res = await api.get(`/avaliacoes/by-reserva/${reservation.id}`);
              avaliacaoFeita = !!res.data && !!res.data.id;
            } catch {}
          }
          return {
            ...reservation,
            mesa: reservation.Mesa ? {
              numero: reservation.Mesa.numero || '-',
              descricao: reservation.Mesa.descricao || '-',
              restaurante: reservation.Mesa.Restaurante ? {
                nome: reservation.Mesa.Restaurante.nome || '-',
              } : undefined,
            } : undefined,
            avaliacaoFeita,
          };
        }));
        setReservations(reservas);
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
      case 'concluida':
        return background ? '#e3f0ff' : '#1976d2';
      default:
        return background ? '#e3e3e3' : '#22223b';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch ((status || '').toLowerCase()) {
      case 'cancelada':
        return <MaterialCommunityIcons name="close-circle-outline" size={20} color="#ff3b30" style={{ marginRight: 6 }} />;
      case 'confirmada':
        return <MaterialCommunityIcons name="check-circle-outline" size={20} color="#4caf50" style={{ marginRight: 6 }} />;
      case 'pendente':
        return <MaterialCommunityIcons name="clock-outline" size={20} color="#ffb300" style={{ marginRight: 6 }} />;
      case 'concluida':
        return <MaterialCommunityIcons name="star-circle-outline" size={20} color="#1976d2" style={{ marginRight: 6 }} />;
      default:
        return <MaterialCommunityIcons name="information-outline" size={20} color="#22223b" style={{ marginRight: 6 }} />;
    }
  };

  const filteredReservations = filter === 'todas'
    ? reservations
    : reservations.filter(r => (r.status || '').toLowerCase() === filter);

  const renderItem = ({ item }: { item: Reservation }) => (
    <Card style={[
      styles.reservationItem,
      { borderLeftWidth: 6, borderLeftColor: getStatusColor(item.status) },
      item.status?.toLowerCase() === 'cancelada' && { backgroundColor: '#fff6f6' },
      item.status?.toLowerCase() === 'confirmada' && { backgroundColor: '#f6fff6' },
      item.status?.toLowerCase() === 'pendente' && { backgroundColor: '#fffdf6' },
      item.status?.toLowerCase() === 'concluida' && { backgroundColor: '#f6f9ff' },
    ]} elevation={4}>
      <Card.Content>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
          <MaterialCommunityIcons name="silverware-fork-knife" size={20} color="#4A44C6" style={{ marginRight: 6 }} />
          <Paragraph style={styles.restaurantName}>{item.mesa?.restaurante?.nome || '-'}</Paragraph>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
          <MaterialCommunityIcons name="table-chair" size={18} color="#ff7a00" style={{ marginRight: 4 }} />
          <Paragraph style={styles.reservationText}>
            <Text style={styles.label}>Mesa:</Text> {item.mesa?.numero || '-'} - {item.mesa?.descricao || '-'}
          </Paragraph>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
          <MaterialCommunityIcons name="calendar" size={18} color="#ff7a00" style={{ marginRight: 4 }} />
          <Paragraph style={styles.reservationText}>
            <Text style={styles.label}>Data:</Text> {new Date(item.dataHora).toLocaleDateString('pt-BR')}
          </Paragraph>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
          <MaterialCommunityIcons name="clock-outline" size={18} color="#ff7a00" style={{ marginRight: 4 }} />
          <Paragraph style={styles.reservationText}>
            <Text style={styles.label}>Horário:</Text> {new Date(item.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </Paragraph>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
          <MaterialCommunityIcons name="account-group-outline" size={18} color="#ff7a00" style={{ marginRight: 4 }} />
          <Paragraph style={styles.reservationText}>
            <Text style={styles.label}>Pessoas:</Text> {item.numeroPessoas}
          </Paragraph>
        </View>
        {item.observacao && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <MaterialCommunityIcons name="note-text-outline" size={18} color="#ff7a00" style={{ marginRight: 4 }} />
            <Paragraph style={styles.reservationText}>
              <Text style={styles.label}>Observação:</Text> {item.observacao}
            </Paragraph>
          </View>
        )}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status, true), flexDirection: 'row', alignItems: 'center' }]}> 
          {getStatusIcon(item.status)}
          <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}> 
            {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Ativa'}
          </Text>
        </View>
        {(item.status?.toLowerCase() === 'pendente' || item.status?.toLowerCase() === 'confirmada') && (
          <Button
            mode="contained"
            style={styles.cancelButton}
            onPress={() => handleCancelReservation(item.id)}
            labelStyle={styles.cancelButtonText}
            icon="close-circle-outline"
          >
            Cancelar Reserva
          </Button>
        )}
        {/* Botão de avaliação para reservas concluídas */}
        {item.status?.toLowerCase() === 'concluida' && !item.avaliacaoFeita && (
          <Button
            mode="outlined"
            style={{ marginTop: 10, borderColor: '#1976d2' }}
            labelStyle={{ color: '#1976d2', fontWeight: 'bold' }}
            icon="star-outline"
            onPress={() => router.push(`/client/rate-restaurant?reservaId=${item.id}&restaurante=${encodeURIComponent(item.mesa?.restaurante?.nome || '')}`)}
            accessibilityLabel="Avaliar restaurante"
          >
            Avaliar Restaurante
          </Button>
        )}
        {/* Texto de avaliação já feita */}
        {item.status?.toLowerCase() === 'concluida' && item.avaliacaoFeita && (
          <Paragraph style={{ marginTop: 10, color: '#1976d2', fontWeight: 'bold', textAlign: 'left' }}>
            <MaterialCommunityIcons name="star" size={18} color="#FFD600" /> Restaurante avaliado
          </Paragraph>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Minhas Reservas</Title>
      <View style={styles.filterBarWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterBarContent}>
          {statusOptions.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.filterButton, filter === opt.value && styles.filterButtonActive]}
              onPress={() => setFilter(opt.value)}
              accessibilityLabel={`Filtrar por ${opt.label}`}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterButtonText, filter === opt.value && styles.filterButtonTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {filteredReservations.length === 0 ? (
        <Paragraph style={styles.noReservationsText}>Nenhuma reserva encontrada.</Paragraph>
      ) : (
        <FlatList
          data={filteredReservations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
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
    marginBottom: 18,
    textAlign: 'center',
    color: '#ff7a00', // Laranja
    letterSpacing: 1,
  },
  filterBarWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterBarContent: {
    flexDirection: 'row',
    paddingHorizontal: 0,
    paddingVertical: 2,
    minHeight: 44,
    alignItems: 'center',
  },
  filterButton: {
    backgroundColor: '#f2f2f2',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
  },
  filterButtonActive: {
    backgroundColor: '#ff7a00',
    borderColor: '#ff7a00',
    shadowColor: '#ffb366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonText: {
    color: '#22223b',
    fontWeight: 'bold',
    fontSize: 15,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  reservationItem: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 0,
    marginHorizontal: 2,
    minHeight: 140,
    justifyContent: 'center',
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