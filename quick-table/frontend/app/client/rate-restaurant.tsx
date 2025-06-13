import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Title, Button, Paragraph, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../services/api';

const RateRestaurant = () => {
  const { reservaId, restaurante } = useLocalSearchParams();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [restauranteId, setRestauranteId] = useState<number | null>(null);
  const router = useRouter();

  // Buscar o restauranteId da reserva
  useEffect(() => {
    const fetchRestauranteId = async () => {
      try {
        const res = await api.get(`/reservas/${reservaId}`);
        setRestauranteId(res.data.Mesa?.restauranteId || res.data.mesaId || null);
      } catch {
        setRestauranteId(null);
      }
    };
    if (reservaId) fetchRestauranteId();
  }, [reservaId]);

  const handleRate = async () => {
    if (rating < 1 || rating > 5) {
      Alert.alert('Atenção', 'Dê uma nota de 1 a 5 estrelas.');
      return;
    }
    if (!restauranteId) {
      Alert.alert('Erro', 'Não foi possível identificar o restaurante.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/avaliacoes', {
        nota: rating,
        comentario: comment,
        reservaId,
        restauranteId,
      });
      Alert.alert('Obrigado!', 'Avaliação enviada com sucesso!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Erro', error?.response?.data?.erro || 'Erro ao enviar avaliação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Avaliar Restaurante</Title>
      <Paragraph style={styles.restaurantName}>{restaurante}</Paragraph>
      <View style={styles.starsRow}>
        {[1,2,3,4,5].map((star) => (
          <MaterialCommunityIcons
            key={star}
            name={rating >= star ? 'star' : 'star-outline'}
            size={40}
            color={rating >= star ? '#FFD600' : '#BDBDBD'}
            onPress={() => setRating(star)}
            accessibilityLabel={`Dar nota ${star}`}
            style={{ marginHorizontal: 4 }}
          />
        ))}
      </View>
      <TextInput
        mode="outlined"
        label="Comentário (opcional)"
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={3}
        style={styles.input}
        placeholder="Deixe um comentário sobre sua experiência"
      />
      <Button
        mode="contained"
        style={styles.button}
        onPress={handleRate}
        loading={loading}
        disabled={loading}
        icon="check-circle-outline"
        accessibilityLabel="Enviar avaliação"
      >
        Enviar Avaliação
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f9f9fb',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ff7a00',
    marginBottom: 12,
    textAlign: 'center',
  },
  restaurantName: {
    fontSize: 18,
    color: '#4A44C6',
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 18,
  },
  input: {
    marginBottom: 18,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#1976d2',
    borderRadius: 16,
    paddingVertical: 10,
  },
});

export default RateRestaurant;
