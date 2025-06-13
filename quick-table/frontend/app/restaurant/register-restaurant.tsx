import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, BackHandler, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Title, Button, TextInput, Paragraph } from 'react-native-paper';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';

const RegisterRestaurant = () => {
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [horarioInicio, setHorarioInicio] = useState('');
    const [horarioFim, setHorarioFim] = useState('');
    const [descricao, setDescricao] = useState('');
    const [localizacao, setLocalizacao] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

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

    // Add real-time formatting for phone and time inputs
    const formatPhone = (text: string) => {
        return text
            .replace(/\D/g, '') // Remove non-numeric characters
            .replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') // Format as (XX) XXXXX-XXXX
            .slice(0, 15); // Limit to 15 characters
    };

    const formatTime = (text: string) => {
        return text
            .replace(/\D/g, '') // Remove non-numeric characters
            .replace(/(\d{2})(\d{2})/, '$1:$2') // Format as HH:MM
            .slice(0, 5); // Limit to 5 characters
    };

    const pickImages = async () => {
        if (images.length >= 6) {
            Alert.alert('Limite de imagens', 'Você pode selecionar no máximo 6 imagens.');
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: 6 - images.length,
            quality: 0.7,
        });
        if (!result.canceled) {
            setImages([...images, ...result.assets.map(a => a.uri)]);
        }
    };

    // Ensure horarioInicio and horarioFim are formatted as HH:MM
    const handleRegister = async () => {
        if (!nome || !telefone || !horarioInicio || !horarioFim || !descricao || !localizacao) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }
        setLoading(true);
        // Format horarioInicio and horarioFim to HH:MM
        const formattedHorarioInicio = horarioInicio.includes(':') ? horarioInicio : `${horarioInicio}:00`;
        const formattedHorarioFim = horarioFim.includes(':') ? horarioFim : `${horarioFim}:00`;

        console.log('Dados enviados para o backend:', { nome, telefone, horarioInicio: formattedHorarioInicio, horarioFim: formattedHorarioFim, descricao, localizacao });

        try {
            const formData = new FormData();
            formData.append('nome', nome);
            formData.append('telefone', telefone);
            formData.append('horarioInicio', formattedHorarioInicio);
            formData.append('horarioFim', formattedHorarioFim);
            formData.append('descricao', descricao);
            formData.append('localizacao', localizacao);
            images.forEach((uri, idx) => {
                formData.append('imagens', {
                    uri,
                    name: `imagem${idx}.jpg`,
                    type: 'image/jpeg',
                } as any);
            });
            const response = await api.post('/restaurantes', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            console.log('Resposta do backend:', response.data);

            if (response.status === 201) {
                const restauranteId = response.data.id || response.data.restaurante?.id;
                if (!restauranteId) {
                    Alert.alert('Erro', 'ID do restaurante não encontrado na resposta do backend.');
                    setLoading(false);
                    return;
                }
                console.log('Salvando restauranteId no AsyncStorage:', restauranteId);
                await AsyncStorage.setItem('restauranteId', JSON.stringify(restauranteId));
                console.log('Restaurante ID salvo no AsyncStorage:', restauranteId);

                Alert.alert('Sucesso', 'Restaurante registrado com sucesso!', [
                    {
                        text: 'OK',
                        onPress: () => router.push('/common/home'),
                    },
                ]);
            } else {
                Alert.alert('Erro', response.data.erro || 'Erro ao cadastrar restaurante.');
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível realizar o registro. Tente novamente.');
        }
        setLoading(false);
    };

    const handleReplaceImage = async (idx: number) => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: false,
            quality: 0.7,
        });
        if (!result.canceled && result.assets.length > 0) {
            setImages(images.map((img, i) => (i === idx ? result.assets[0].uri : img)));
        }
    };

    const moveImage = (from: number, to: number) => {
        if (to < 0 || to >= images.length) return;
        const newImages = [...images];
        const [moved] = newImages.splice(from, 1);
        newImages.splice(to, 0, moved);
        setImages(newImages);
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
                <Title style={styles.title}>Cadastro de Restaurante</Title>
                <View style={styles.formCard}>
                    <TextInput
                        mode="outlined"
                        style={styles.input}
                        label="Nome do Restaurante"
                        value={nome}
                        onChangeText={setNome}
                        placeholder="Ex: Pizzaria do João"
                        left={<TextInput.Icon icon="store" color="#ff7a00" />}
                        theme={{ colors: { primary: '#ff7a00' } }}
                    />
                    <TextInput
                        mode="outlined"
                        style={styles.input}
                        label="Telefone"
                        keyboardType="phone-pad"
                        value={telefone}
                        onChangeText={(text) => setTelefone(formatPhone(text))}
                        placeholder="(99) 99999-9999"
                        left={<TextInput.Icon icon="phone" color="#ff7a00" />}
                        theme={{ colors: { primary: '#ff7a00' } }}
                    />
                    <TextInput
                        mode="outlined"
                        style={styles.input}
                        label="Horário de Abertura (HH:MM)"
                        keyboardType="numeric"
                        value={horarioInicio}
                        onChangeText={(text) => setHorarioInicio(formatTime(text))}
                        placeholder="08:00"
                        left={<TextInput.Icon icon="clock-outline" color="#ff7a00" />}
                        theme={{ colors: { primary: '#ff7a00' } }}
                    />
                    <TextInput
                        mode="outlined"
                        style={styles.input}
                        label="Horário de Fechamento (HH:MM)"
                        keyboardType="numeric"
                        value={horarioFim}
                        onChangeText={(text) => setHorarioFim(formatTime(text))}
                        placeholder="22:00"
                        left={<TextInput.Icon icon="clock-outline" color="#ff7a00" />}
                        theme={{ colors: { primary: '#ff7a00' } }}
                    />
                    <TextInput
                        mode="outlined"
                        style={styles.input}
                        label="Descrição do Restaurante"
                        value={descricao}
                        onChangeText={setDescricao}
                        placeholder="Ex: Ambiente familiar, pizzas artesanais..."
                        left={<TextInput.Icon icon="text" color="#ff7a00" />}
                        multiline
                        numberOfLines={2}
                        theme={{ colors: { primary: '#ff7a00' } }}
                    />
                    <TextInput
                        mode="outlined"
                        style={styles.input}
                        label="Localização"
                        value={localizacao}
                        onChangeText={setLocalizacao}
                        placeholder="Ex: Av. Central, 123"
                        left={<TextInput.Icon icon="map-marker" color="#ff7a00" />}
                        theme={{ colors: { primary: '#ff7a00' } }}
                    />
                    <View style={styles.imagePickerRow}>
                        <Button mode="outlined" onPress={pickImages} style={styles.imagePickerButton} labelStyle={styles.imagePickerButtonText} disabled={images.length >= 6}>
                            Selecionar Imagens <Paragraph style={styles.imageCount}>({images.length}/6)</Paragraph>
                        </Button>
                    </View>
                    <View style={styles.imagePreviewRow}>
                        {Array.from({ length: 2 }).map((_, rowIdx) => (
                            <View key={rowIdx} style={styles.imagePreviewRowInner}>
                                {images.slice(rowIdx * 3, rowIdx * 3 + 3).map((uri, idx) => {
                                    const realIdx = rowIdx * 3 + idx;
                                    return (
                                        <View key={realIdx} style={styles.imageThumbWrapper}>
                                            <TouchableOpacity
                                                style={styles.removeImageButton}
                                                onPress={() => setImages(images.filter((_, i) => i !== realIdx))}
                                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                            >
                                                <MaterialIcons name="cancel" size={24} color="#ff4c4c" style={{ zIndex: 3 }} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={{ flex: 1 }}
                                                onPress={() => handleReplaceImage(realIdx)}
                                                activeOpacity={0.7}
                                            >
                                                <Image source={{ uri }} style={styles.imageThumb} />
                                            </TouchableOpacity>
                                            <View style={styles.imageOrderButtons}>
                                                <TouchableOpacity onPress={() => moveImage(realIdx, realIdx - 1)} disabled={realIdx === 0} style={styles.orderBtn}>
                                                    <MaterialIcons name="arrow-back-ios" size={18} color={realIdx === 0 ? '#ccc' : '#ff7a00'} />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => moveImage(realIdx, realIdx + 1)} disabled={realIdx === images.length - 1} style={styles.orderBtn}>
                                                    <MaterialIcons name="arrow-forward-ios" size={18} color={realIdx === images.length - 1 ? '#ccc' : '#ff7a00'} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        ))}
                    </View>
                    <Button
                        mode="contained"
                        style={styles.button}
                        onPress={handleRegister}
                        labelStyle={styles.buttonText}
                        loading={loading}
                        disabled={loading}
                        contentStyle={styles.buttonContent}
                    >
                        CADASTRAR
                    </Button>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f5f6',
        padding: 24,
    },
    title: {
        fontSize: 30,
        fontWeight: '800',
        color: '#ff7a00',
        marginBottom: 24,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    formCard: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 28,
        padding: 24,
        shadowColor: '#ffb366',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.10,
        shadowRadius: 16,
        elevation: 5,
        marginBottom: 16,
        alignSelf: 'center',
    },
    input: {
        marginBottom: 14,
        backgroundColor: '#fffaf5',
        borderRadius: 18,
        fontSize: 16,
        borderWidth: 0, // Remove a borda extra do container externo
        paddingLeft: 8,
    },
    button: {
        backgroundColor: '#ff7a00',
        borderRadius: 18,
        marginTop: 18,
        width: '100%',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#ffb366',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 6,
        minHeight: 54,
        justifyContent: 'center',
        alignSelf: 'center',
        overflow: 'visible', // Garante que não será cortado
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    imagePickerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 12,
    },
    imagePickerButton: {
        borderColor: '#ff7a00',
        borderWidth: 2,
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 10,
        paddingHorizontal: 18,
        elevation: 1,
        shadowColor: '#ffb366',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 6,
    },
    imagePickerButtonText: {
        color: '#ff7a00',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    imageCount: {
        color: '#ff7a00',
        fontWeight: 'bold',
        fontSize: 15,
    },
    imagePreviewRow: {
        marginBottom: 18,
        minHeight: 150,
    },
    imagePreviewRowInner: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 18, // aumentado para dar mais espaço entre as linhas
        gap: 12, // aumenta o espaço horizontal entre as imagens
    },
    imageThumbWrapper: {
        borderRadius: 12,
        overflow: 'visible',
        margin: 4,
        marginBottom: 24, // aumenta o espaço abaixo de cada imagem para os botões de ordem
        borderWidth: 2,
        borderColor: '#ffb366',
        backgroundColor: '#fffaf5',
        elevation: 2,
        width: 64,
        height: 64,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    removeImageButton: {
        position: 'absolute',
        top: -12,
        right: -12,
        zIndex: 3,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 2,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#ff4c4c',
    },
    imageOrderButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: -28, // afastar mais da borda inferior
        left: 0,
        right: 0,
        zIndex: 2,
    },
    orderBtn: {
        marginHorizontal: 4, // aumentar espaçamento lateral
        backgroundColor: '#fff',
        borderRadius: 12, // levemente maior
        padding: 4, // aumentar área de toque
        elevation: 1,
    },
    imageThumb: {
        width: 64,
        height: 64,
        resizeMode: 'cover',
        borderRadius: 12,
    },
});


export default RegisterRestaurant;