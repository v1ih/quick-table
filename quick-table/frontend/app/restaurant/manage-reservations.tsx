import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, FlatList, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Card, Button, Title, Paragraph } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../services/api';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

const statusOptions = [
  { label: 'Todas', value: 'todas' },
  { label: 'Pendente', value: 'pendente' },
  { label: 'Confirmada', value: 'confirmada' },
  { label: 'Concluída', value: 'concluida' },
  { label: 'Cancelada', value: 'cancelada' },
];

// Tipagem para reserva
interface Reservation {
  id: number;
  dataHora: string;
  status: string;
  numeroPessoas: number;
  usuario?: { nome: string; telefone?: string };
  mesa?: { numero: string; descricao: string };
}

const ManageReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('todas');
  const [filterDate, setFilterDate] = useState<string>('');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      console.log('Tentando buscar reservas...');
      const response = await api.get('/restaurantes/reservas'); // Corrigido para o plural
      console.log('Resposta recebida:', response.data);
      setReservations(response.data);
    } catch (error) {
      console.log('Erro ao buscar reservas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as reservas.');
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const response = await api.patch(`/restaurantes/reservas/${id}/status`, { status });
      Alert.alert('Sucesso', 'Status da reserva atualizado!');
      fetchReservations();
    } catch (error) {
      console.log('Erro ao atualizar status:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o status da reserva.');
    }
  };

  const filteredReservations = reservations.filter((r: Reservation) => {
    const statusMatch = filterStatus === 'todas' || (r.status || '').toLowerCase() === filterStatus;
    const dateMatch = !filterDate || r.dataHora.startsWith(filterDate);
    return statusMatch && dateMatch;
  });

  const getStatusColor = (status: string, background = false) => {
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

  const getStatusIcon = (status: string) => {
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

  const formatDateBR = (dateStr: string) => {
    const date = new Date(dateStr);
    return date ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth()+1).toString().padStart(2, '0')}/${date.getFullYear()}` : '';
  };
  const formatHourBR = (dateStr: string) => {
    const date = new Date(dateStr);
    return date ? `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}` : '';
  };

  const renderItem = ({ item }: { item: Reservation }) => {
    const podeCancelar = item.status === 'pendente' || item.status === 'confirmada';
    const podeConfirmar = item.status === 'pendente';
    const podeConcluir = item.status === 'confirmada';
    return (
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
            <MaterialCommunityIcons name="account" size={20} color="#4A44C6" style={{ marginRight: 6 }} />
            <Paragraph style={styles.restaurantName}>{item.usuario?.nome || '-'}</Paragraph>
            {item.usuario?.telefone && (
              <Text style={{ color: '#888', fontSize: 15, marginLeft: 8 }}>
                <MaterialCommunityIcons name="phone" size={16} color="#888" /> {item.usuario.telefone}
              </Text>
            )}
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
              <Text style={styles.label}>Data:</Text> {formatDateBR(item.dataHora)}
            </Paragraph>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <MaterialCommunityIcons name="clock-outline" size={18} color="#ff7a00" style={{ marginRight: 4 }} />
            <Paragraph style={styles.reservationText}>
              <Text style={styles.label}>Horário:</Text> {formatHourBR(item.dataHora)}
            </Paragraph>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <MaterialCommunityIcons name="account-group-outline" size={18} color="#ff7a00" style={{ marginRight: 4 }} />
            <Paragraph style={styles.reservationText}>
              <Text style={styles.label}>Pessoas:</Text> {item.numeroPessoas}
            </Paragraph>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status, true), flexDirection: 'row', alignItems: 'center' }]}> 
            {getStatusIcon(item.status)}
            <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}> 
              {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Ativa'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            {podeCancelar && (
              <Button mode="outlined" style={styles.actionButton} onPress={() => handleUpdateStatus(item.id, 'cancelada')} icon="close-circle-outline" textColor="#ff3b30">Cancelar</Button>
            )}
            {podeConfirmar && (
              <Button mode="outlined" style={styles.actionButton} onPress={() => handleUpdateStatus(item.id, 'confirmada')} icon="check-circle-outline" textColor="#4caf50">Confirmar</Button>
            )}
            {podeConcluir && (
              <Button mode="outlined" style={styles.actionButton} onPress={() => handleUpdateStatus(item.id, 'concluida')} icon="star-circle-outline" textColor="#1976d2">Concluir</Button>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Input de data para filtro
  const handleDateInput = (text: string) => {
    // Aceita apenas formato AAAA-MM-DD
    if (/^\d{0,4}-?\d{0,2}-?\d{0,2}$/.test(text)) {
      setFilterDate(text);
    }
  };

  // Date picker para filtro de data
  const showDatePicker = () => {
    const today = filterDate ? new Date(filterDate) : new Date();
    DateTimePickerAndroid.open({
      value: today,
      onChange: (event, selectedDate) => {
        if (selectedDate) {
          // Formato brasileiro DD/MM/AAAA para exibição, mas filtro usa AAAA-MM-DD
          const yyyy = selectedDate.getFullYear();
          const mm = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
          const dd = selectedDate.getDate().toString().padStart(2, '0');
          setFilterDate(`${yyyy}-${mm}-${dd}`);
        }
      },
      mode: 'date',
      is24Hour: true,
    });
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Gerenciar Reservas</Title>
      <View style={styles.filterBarWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterBarContent}>
          {statusOptions.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.filterButton, filterStatus === opt.value && styles.filterButtonActive]}
              onPress={() => setFilterStatus(opt.value)}
              accessibilityLabel={`Filtrar por ${opt.label}`}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterButtonText, filterStatus === opt.value && styles.filterButtonTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {/* Filtro por data (input simples) */}
      {/* Pode ser substituído por um datepicker se desejar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <MaterialCommunityIcons name="calendar-search" size={20} color="#ff7a00" style={{ marginRight: 6 }} />
        <Text style={{ fontWeight: 'bold', color: '#22223b', marginRight: 6 }}>Filtrar por data:</Text>
      </View>
      <View style={{ marginBottom: 16 }}>
        <Card style={{ padding: 8, borderRadius: 12, backgroundColor: '#fffaf5', elevation: 1 }}>
          <TouchableOpacity onPress={showDatePicker} accessibilityLabel="Abrir calendário para filtrar por data">
            <Text style={{ color: '#22223b', fontSize: 16 }}>
              {filterDate
                ? `${filterDate.split('-')[2]}/${filterDate.split('-')[1]}/${filterDate.split('-')[0]}`
                : 'Clique para escolher a data'}
            </Text>
          </TouchableOpacity>
        </Card>
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
    color: '#ff7a00',
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
  actionButton: {
    marginRight: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#ff7a00',
    backgroundColor: '#fffaf5',
    minWidth: 110,
    marginBottom: 2,
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

export default ManageReservations;
