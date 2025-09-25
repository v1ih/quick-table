import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, BackHandler, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Title, Button, TextInput, Paragraph } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';
import { MaterialIcons } from '@expo/vector-icons';

const EditTable = () => {
    const router = useRouter();
    const searchParams = useLocalSearchParams();
    const id = searchParams.id;
    const [numero, setNumero] = useState('');
    const [capacidade, setCapacidade] = useState('');
    const [descricao, setDescricao] = useState('');
    const [disponivel, setDisponivel] = useState(true);
    const [images, setImages] = useState<string[]>([]);

    useEffect(() => {
        console.log('ID recebido:', id); // Adiciona um log para verificar o valor do ID
        const fetchTableData = async () => {
            try {
                const response = await api.get(`/mesas/${id}`);
                const { numero, capacidade, descricao, disponivel, imagens } = response.data;
                setNumero(numero);
                setCapacidade(capacidade);
                setDescricao(descricao);
                setDisponivel(disponivel);
                setImages(imagens ? imagens.map((img: string) => {
                    const path = img.startsWith('/') ? img : `/${img}`;
                    return `${api.defaults.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, '') : ''}${path}`;
                }) : []);
            } catch (error) {
                Alert.alert('Erro', 'Não foi possível carregar os dados da mesa.');
            }
        };

        if (id) {
            fetchTableData();
        }
    }, [id]);

    useEffect(() => {
        if (numero || capacidade || descricao) {
            console.log('Dados carregados nos campos:', { numero, capacidade, descricao, disponivel });
        }
    }, [numero, capacidade, descricao, disponivel]);

    useEffect(() => {
        const backAction = () => {
            Alert.alert(
                'Descartar alterações',
                'Tem certeza de que deseja descartar as alterações e voltar para Gerenciar Mesas?',
                [
                    {
                        text: 'Cancelar',
                        onPress: () => null,
                        style: 'cancel',
                    },
                    {
                        text: 'Sim',
                        onPress: () => router.replace('/restaurant/manage-tables'),
                    },
                ]
            );
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

    const handleSave = async () => {
        if (!numero || !capacidade || !descricao) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }
        try {
            const formData = new FormData();
            formData.append('numero', numero);
            formData.append('capacidade', capacidade);
            formData.append('descricao', descricao);
            formData.append('disponivel', disponivel ? 'true' : 'false');

            // Separe imagens antigas (URL/backend) e novas (file://)
            const imagensAntigas: string[] = [];
            const imagensNovas: { uri: string; name: string; type: string }[] = [];
            images.forEach((img, idx) => {
                if (
                    img.startsWith('http') ||
                    img.startsWith('/uploads') ||
                    img.startsWith('uploads')
                ) {
                    let relative = img;
                    if (img.startsWith('http')) {
                        const match = img.match(/(\/uploads\/.*)/);
                        if (match) relative = match[1];
                    }
                    imagensAntigas.push(relative);
                } else if (img.startsWith('file://')) {
                    imagensNovas.push({
                        uri: img,
                        name: `imagem${idx}.jpg`,
                        type: 'image/jpeg',
                    });
                }
            });
            // Envie as antigas como JSON string
            formData.append('imagens', JSON.stringify(imagensAntigas));
            // E as novas como arquivos
            imagensNovas.forEach(imgObj => {
                formData.append('imagens', imgObj as any);
            });

            await api.put(`/mesas/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            Alert.alert('Sucesso', 'Mesa atualizada com sucesso!', [
                {
                    text: 'OK',
                    onPress: () => router.replace('/restaurant/manage-tables'),
                },
            ]);
        } catch (error) {
            Alert.alert('Erro', 'Erro ao atualizar a mesa.');
        }
    };

    return (
        <View style={styles.container}>
            <Title style={styles.title}>Editar Mesa</Title>
            <TextInput
                mode="outlined"
                style={styles.input}
                label="Número da Mesa"
                value={numero.toString()}
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
                value={capacidade.toString()}
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
            <Button
                mode={disponivel ? 'contained' : 'outlined'}
                style={[styles.toggleButton, disponivel ? styles.available : styles.unavailable]}
                onPress={() => setDisponivel(!disponivel)}
                labelStyle={styles.buttonText}
            >
                {disponivel ? 'Disponível' : 'Indisponível'}
            </Button>
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
            <Button mode="contained" style={styles.saveButton} onPress={handleSave} labelStyle={styles.buttonText}>
                Salvar Alterações
            </Button>
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
    saveButton: {
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

export default EditTable;