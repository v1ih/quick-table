import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Paragraph, ActivityIndicator, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../services/api';

const RestaurantReviews = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState<number | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Busca restaurante do usuário logado
        const resRest = await api.get('/restaurantes/me');
        const restauranteId = resRest.data.id;
        // Busca avaliações
        const res = await api.get(`/avaliacoes/${restauranteId}`);
        setReviews(res.data);
        if (res.data.length > 0) {
          const sum = res.data.reduce((acc: number, r: any) => acc + (r.nota || 0), 0);
          setMedia(sum / res.data.length);
        } else {
          setMedia(null);
        }
      } catch {
        setReviews([]);
        setMedia(null);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const renderStars = (nota: number) => (
    <View style={{ flexDirection: 'row', marginRight: 6 }}>
      {[1,2,3,4,5].map(i => (
        <MaterialCommunityIcons
          key={i}
          name={i <= nota ? 'star' : 'star-outline'}
          size={20}
          color={i <= nota ? '#FFD600' : '#BDBDBD'}
        />
      ))}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.title}>Avaliações dos Clientes</Title>
      {loading ? (
        <ActivityIndicator size="large" color="#ff7a00" style={{ marginTop: 32 }} />
      ) : (
        <>
          <View style={styles.mediaBox}>
            <Text style={styles.mediaLabel}>Nota do Restaurante</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {renderStars(Math.round(media || 0))}
              <Text style={styles.mediaValue}>{media ? media.toFixed(1) : '-'}</Text>
            </View>
          </View>
          {reviews.length === 0 ? (
            <Paragraph style={styles.noReviews}>Nenhuma avaliação encontrada.</Paragraph>
          ) : (
            reviews.map((review, idx) => (
              <View key={idx} style={styles.reviewCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  {renderStars(review.nota)}
                  <Text style={styles.notaText}>{review.nota}/5</Text>
                </View>
                <Paragraph style={review.comentario ? styles.comentario : styles.semComentario}>
                  {review.comentario ? review.comentario : 'Sem comentário'}
                </Paragraph>
                <Text style={styles.usuario}>
                  {review.Usuario && review.Usuario.nome ? review.Usuario.nome : 'Cliente'}
                </Text>
              </View>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9f9fb',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff7a00',
    marginBottom: 18,
    textAlign: 'center',
    letterSpacing: 1,
  },
  mediaBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    alignItems: 'center',
    shadowColor: '#ff7a00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ffb366',
  },
  mediaLabel: {
    fontSize: 16,
    color: '#ff7a00',
    marginBottom: 2,
    fontWeight: 'bold',
  },
  mediaValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff7a00',
    marginLeft: 6,
  },
  noReviews: {
    textAlign: 'center',
    color: '#888',
    marginTop: 32,
    fontSize: 16,
  },
  reviewCard: {
    backgroundColor: '#fffaf5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#ff7a00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#ffb366',
  },
  notaText: {
    fontSize: 15,
    color: '#ff7a00',
    marginLeft: 6,
    fontWeight: 'bold',
  },
  comentario: {
    fontSize: 15,
    color: '#22223b',
    marginTop: 2,
    marginBottom: 4,
    fontStyle: 'normal',
  },
  semComentario: {
    fontSize: 15,
    color: '#888',
    marginTop: 2,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  usuario: {
    fontSize: 13,
    color: '#1976d2',
    marginTop: 2,
    textAlign: 'right',
    fontWeight: 'bold',
  },
});

export default RestaurantReviews;
