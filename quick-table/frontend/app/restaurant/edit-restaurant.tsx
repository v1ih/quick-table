import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, BackHandler, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Title, Button, TextInput, Paragraph } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../services/api';

const EditRestaurant = () => {
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [localizacao, setLocalizacao] = useState('');
    const [telefone, setTelefone] = useState('');
    const [horarioInicio, setHorarioInicio] = useState('');
    const [horarioFim, setHorarioFim] = useState('');
    const [id, setId] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

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

    useEffect(() => {
        const fetchUserRestaurant = async () => {
            try {
                const response = await api.get('/restaurantes/me');
                const { nome, descricao, localizacao, telefone, horarioInicio, horarioFim, id, imagens } = response.data;
                setNome(nome);
                setDescricao(descricao);
                setLocalizacao(localizacao);
                setTelefone(telefone);
                setHorarioInicio(horarioInicio ? horarioInicio.slice(0,5) : '');
                setHorarioFim(horarioFim ? horarioFim.slice(0,5) : '');
                setId(id);
                setImages(imagens ? imagens.map((img: string) => {
                    // Corrige para garantir que sempre começa com barra
                    const path = img.startsWith('/') ? img : `/${img}`;
                    return `${api.defaults.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, '') : ''}${path}`;
                }) : []);
            } catch (error) {
                Alert.alert('Erro', 'Não foi possível carregar os dados do restaurante.');
            }
        };
        fetchUserRestaurant();
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

    const handleSave = async () => {
        if (!nome || !descricao || !localizacao || !telefone || !horarioInicio || !horarioFim) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('nome', nome);
            formData.append('descricao', descricao);
            formData.append('localizacao', localizacao);
            formData.append('telefone', telefone);
            formData.append('horarioInicio', horarioInicio);
            formData.append('horarioFim', horarioFim);
            // Envie imagens já existentes como string e novas como arquivo
            images.forEach((img, idx) => {
                if (
                    img.startsWith('http') ||
                    img.startsWith('/uploads') ||
                    img.startsWith('uploads')
                ) {
                    // Imagem já existente no backend
                    let relative = img;
                    if (img.startsWith('http')) {
                        const match = img.match(/(\/uploads\/.*)/);
                        if (match) relative = match[1];
                    }
                    formData.append('imagens', relative);
                } else if (img.startsWith('file://')) {
                    // Imagem nova (local), envia como arquivo
                    formData.append('imagens', {
                        uri: img,
                        name: `imagem${idx}.jpg`,
                        type: 'image/jpeg',
                    } as any);
                }
            });
            await api.put(`/restaurantes/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            Alert.alert('Sucesso', 'Restaurante atualizado com sucesso!', [
                {
                    text: 'OK',
                    onPress: () => router.push('/common/home'),
                },
            ]);
        } catch (error) {
            Alert.alert('Erro', 'Erro ao atualizar o restaurante.');
        }
        setLoading(false);
    };

    const handleDeleteRestaurant = async () => {
        Alert.alert(
            'Confirmação',
            'Tem certeza de que deseja excluir este restaurante? Esta ação não pode ser desfeita.',
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
                            await api.delete(`/restaurantes/${id}`);
                            Alert.alert('Sucesso', 'Restaurante excluído com sucesso!', [
                                {
                                    text: 'OK',
                                    onPress: () => router.replace('/common/home'),
                                },
                            ]);
                        } catch (error) {
                            Alert.alert('Erro', 'Erro ao excluir o restaurante.');
                        }
                    },
                },
            ]
        );
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
                <Title style={styles.title}>Editar Restaurante</Title>
                <View style={styles.formCard}>
                    <TextInput
                        mode="outlined"
                        style={styles.input}
                        label="Nome do Restaurante"
                        value={nome}
                        onChangeText={setNome}
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
                        left={<TextInput.Icon icon="clock-outline" color="#ff7a00" />}
                        theme={{ colors: { primary: '#ff7a00' } }}
                    />
                    <TextInput
                        mode="outlined"
                        style={styles.input}
                        label="Descrição do Restaurante"
                        value={descricao}
                        onChangeText={setDescricao}
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
                                                <Image
                                                    source={{ uri }}
                                                    style={styles.imageThumb}
                                                />
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
                        onPress={handleSave}
                        labelStyle={styles.buttonText}
                        loading={loading}
                        disabled={loading}
                        contentStyle={styles.buttonContent}
                    >
                        SALVAR ALTERAÇÕES
                    </Button>
                    <Button
                        mode="contained"
                        style={[styles.button, styles.deleteButton]}
                        onPress={handleDeleteRestaurant}
                        labelStyle={styles.buttonText}
                        contentStyle={styles.buttonContent}
                    >
                        EXCLUIR RESTAURANTE
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
        color: '#ff7a00', // laranja igual ao cadastro
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
        overflow: 'visible',
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
    deleteButton: {
        backgroundColor: '#ff4c4c',
        marginTop: 8,
    },
    imagePickerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    imagePickerButton: {
        flex: 1,
        borderColor: '#ff7a00',
        borderWidth: 2,
        borderRadius: 18,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePickerButtonText: {
        color: '#ff7a00',
        fontWeight: 'bold',
    },
    imageCount: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    imagePreviewRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    imagePreviewRowInner: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'flex-start',
        width: '100%',
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
        width: 88,
        height: 88,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    imageThumb: {
        width: 88,
        height: 88,
        resizeMode: 'cover',
        borderRadius: 12,
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
});


export default EditRestaurant;