import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, BackHandler, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Title, Button, TextInput, Paragraph } from 'react-native-paper';
import api from '../../services/api';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';

const AddTable = () => {
    const [numero, setNumero] = useState('');
    const [capacidade, setCapacidade] = useState('');
    const [descricao, setDescricao] = useState('');
    const [disponivel, setDisponivel] = useState(true);
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkRestauranteId = async () => {
            const restauranteId = await AsyncStorage.getItem('restauranteId');
            console.log('Restaurante ID no useEffect do AddTable:', restauranteId);
        };
        checkRestauranteId();
    }, []);

    useEffect(() => {
        const backAction = () => {
            router.replace('/restaurant/manage-tables');
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, []);

    const pickImages = async () => {
        if (images.length >= 3) {
            Alert.alert('Limite de imagens', 'Você pode selecionar no máximo 3 imagens.');
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: 3 - images.length,
            quality: 0.7,
        });
        if (!result.canceled) {
            setImages([...images, ...result.assets.map(a => a.uri)]);
        }
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

    const handleAddTable = async () => {
        if (!numero || !capacidade || !descricao) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }
        setLoading(true);
        try {
            const restauranteId = await AsyncStorage.getItem('restauranteId');
            if (!restauranteId) {
                Alert.alert('Erro', 'ID do restaurante não encontrado. Certifique-se de que o restaurante foi registrado corretamente.');
                setLoading(false);
                return;
            }
            const formData = new FormData();
            formData.append('numero', numero);
            formData.append('capacidade', capacidade);
            formData.append('descricao', descricao);
            formData.append('disponivel', disponivel ? 'true' : 'false');
            formData.append('restauranteId', JSON.parse(restauranteId).toString());
            images.forEach((uri, idx) => {
                formData.append('imagens', {
                    uri,
                    name: `imagem${idx}.jpg`,
                    type: 'image/jpeg',
                } as any);
            });
            const response = await api.post('/mesas', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (response.status === 201) {
                Alert.alert('Sucesso', 'Mesa adicionada com sucesso!', [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/restaurant/manage-tables'),
                    },
                ]);
            } else {
                Alert.alert('Erro', 'Erro ao adicionar mesa. Verifique os dados e tente novamente.');
            }
        } catch (error) {
            console.error('Erro ao adicionar mesa:', error);
            Alert.alert('Erro', 'Erro ao adicionar mesa. Tente novamente mais tarde.');
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Title style={styles.title}>Adicionar Mesa</Title>
            <View style={styles.formCard}>
                <TextInput
                    mode="outlined"
                    style={styles.input}
                    label="Número da Mesa"
                    value={numero}
                    onChangeText={setNumero}
                    placeholder="Ex: 10"
                    left={<TextInput.Icon icon="table" color="#ff7a00" />}
                    theme={{ colors: { primary: '#ff7a00' } }}
                />
                <TextInput
                    mode="outlined"
                    style={styles.input}
                    label="Capacidade"
                    keyboardType="numeric"
                    value={capacidade}
                    onChangeText={setCapacidade}
                    placeholder="Ex: 4"
                    left={<TextInput.Icon icon="account-group" color="#ff7a00" />}
                    theme={{ colors: { primary: '#ff7a00' } }}
                />
                <TextInput
                    mode="outlined"
                    style={styles.input}
                    label="Descrição"
                    value={descricao}
                    onChangeText={setDescricao}
                    placeholder="Ex: Próxima à janela, espaço reservado..."
                    left={<TextInput.Icon icon="text" color="#ff7a00" />}
                    multiline
                    numberOfLines={2}
                    theme={{ colors: { primary: '#ff7a00' } }}
                />
                <View style={styles.imagePickerRow}>
                    <Button mode="outlined" onPress={pickImages} style={styles.imagePickerButton} labelStyle={styles.imagePickerButtonText} disabled={images.length >= 3}>
                        Selecionar Imagens <Paragraph style={styles.imageCount}>({images.length}/3)</Paragraph>
                    </Button>
                </View>
                <View style={styles.imagePreviewRow}>
                    <View style={styles.imagePreviewRowInner}>
                        {images.map((uri, idx) => (
                            <View key={idx} style={styles.imageThumbWrapper}>
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => setImages(images.filter((_, i) => i !== idx))}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <MaterialIcons name="cancel" size={24} color="#ff4c4c" style={{ zIndex: 3 }} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{ flex: 1 }}
                                    onPress={() => handleReplaceImage(idx)}
                                    activeOpacity={0.7}
                                >
                                    <Image source={{ uri }} style={styles.imageThumb} />
                                </TouchableOpacity>
                                <View style={styles.imageOrderButtons}>
                                    <TouchableOpacity onPress={() => moveImage(idx, idx - 1)} disabled={idx === 0} style={styles.orderBtn}>
                                        <MaterialIcons name="arrow-back-ios" size={18} color={idx === 0 ? '#ccc' : '#ff7a00'} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => moveImage(idx, idx + 1)} disabled={idx === images.length - 1} style={styles.orderBtn}>
                                        <MaterialIcons name="arrow-forward-ios" size={18} color={idx === images.length - 1 ? '#ccc' : '#ff7a00'} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
                <Button
                    mode={disponivel ? 'contained' : 'outlined'}
                    style={[styles.toggleButton, disponivel ? styles.available : styles.unavailable]}
                    onPress={() => setDisponivel(!disponivel)}
                    labelStyle={styles.buttonText}
                >
                    {disponivel ? 'Disponível' : 'Indisponível'}
                </Button>
                <Button mode="contained" style={styles.addButton} onPress={handleAddTable} labelStyle={styles.buttonText} loading={loading} disabled={loading}>
                    Adicionar Mesa
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#f4f5f6',
    },
    title: {
        fontSize: 28,
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
        borderWidth: 0,
        paddingLeft: 8,
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
        minHeight: 90,
    },
    imagePreviewRowInner: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 18,
        gap: 12,
    },
    imageThumbWrapper: {
        borderRadius: 12,
        overflow: 'visible',
        margin: 4,
        marginBottom: 24,
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
        bottom: -28,
        left: 0,
        right: 0,
        zIndex: 2,
    },
    orderBtn: {
        marginHorizontal: 4,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 4,
        elevation: 1,
    },
    imageThumb: {
        width: 64,
        height: 64,
        resizeMode: 'cover',
        borderRadius: 12,
    },
    toggleButton: {
        padding: 15,
        borderRadius: 18,
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 8,
    },
    available: {
        backgroundColor: '#28A745',
    },
    unavailable: {
        backgroundColor: '#DC3545',
    },
    addButton: {
        backgroundColor: '#ff7a00',
        paddingVertical: 16,
        borderRadius: 18,
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
        overflow: 'visible',
        marginBottom: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
});

export default AddTable;