import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, BackHandler, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';

const EditProfile = () => {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [fotoPerfil, setFotoPerfil] = useState<string | null>(null); // URL completa para exibir
    const [fotoPerfilLocal, setFotoPerfilLocal] = useState<string | null>(null); // Apenas local, para upload
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    // Carrega dados do usuário ao abrir a tela
    useEffect(() => {
        const fetchUserData = async () => {
            const storedUser = await AsyncStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setNome(parsedUser.nome);
                setEmail(parsedUser.email);
                setTelefone(parsedUser.telefone || '');
                console.log('fotoPerfil carregado:', parsedUser.fotoPerfil);
                if (parsedUser.fotoPerfil) {
                    const isFullUrl = parsedUser.fotoPerfil.startsWith('http');
                    const urlFinal = isFullUrl
                        ? parsedUser.fotoPerfil
                        : (api.defaults.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, '') : '') + '/' + parsedUser.fotoPerfil.replace(/\\/g, '/');
                    console.log('URL final da imagem:', urlFinal);
                    setFotoPerfil(urlFinal);
                } else {
                    setFotoPerfil(null);
                }
            }
        };
        fetchUserData();
    }, []);

    // Confirmação ao sair sem salvar
    useEffect(() => {
        const backAction = () => {
            Alert.alert(
                'Descartar alterações',
                'Tem certeza de que deseja descartar as alterações e voltar para o perfil?',
                [
                    { text: 'Cancelar', onPress: () => null, style: 'cancel' },
                    { text: 'Sim', onPress: () => router.replace('/common/profile') },
                ]
            );
            return true;
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, []);

    // Formatação do telefone
    const formatPhone = (text: string) => {
        return text
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
            .slice(0, 15);
    };

    // Seleciona imagem do dispositivo
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, // Forma recomendada
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setFotoPerfilLocal(result.assets[0].uri);
            setFotoPerfil(result.assets[0].uri);
        }
    };

    // Salva todas as alterações (dados + imagem)
    const handleSave = async () => {
        setUploading(true);
        try {
            let fotoPerfilPath = null;

            // Se o usuário escolheu uma nova imagem, faz upload
            if (fotoPerfilLocal) {
                const formData = new FormData();
                formData.append('fotoPerfil', {
                    uri: fotoPerfilLocal,
                    name: 'profile.jpg',
                    type: 'image/jpeg',
                } as any);

                const response = await api.post('/auth/perfil/foto', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                if (response.data.fotoPerfil) {
                    fotoPerfilPath = response.data.fotoPerfil; // Caminho relativo retornado pelo backend
                }
            }

            // Atualiza os dados do perfil (incluindo a URL relativa da imagem)
            const response = await api.put('/auth/perfil', {
                nome,
                email,
                telefone,
                fotoPerfil: fotoPerfilPath || (fotoPerfil ? fotoPerfil.replace(api.defaults.baseURL + '/', '') : null),
            });

            const updatedUser = response.data.usuario;
            // Monta a URL completa para exibir a imagem
            const fotoPerfilUrl = updatedUser.fotoPerfil
                ? api.defaults.baseURL + '/' + updatedUser.fotoPerfil.replace(/\\/g, '/')
                : null;
            setFotoPerfil(fotoPerfilUrl);

            // Salva o usuário atualizado no AsyncStorage
            await AsyncStorage.setItem('user', JSON.stringify({
                ...updatedUser,
                fotoPerfil: updatedUser.fotoPerfil || null
            }));

            Alert.alert('Sucesso', 'Perfil atualizado com sucesso!', [
                { text: 'OK', onPress: () => router.replace('/common/profile') },
            ]);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível atualizar o perfil. Tente novamente.');
        } finally {
            setUploading(false);
            setFotoPerfilLocal(null); // Limpa imagem local após upload
        }
    };

    // Exclui a conta do usuário
    const handleDeleteAccount = async () => {
        Alert.alert(
            'Confirmação',
            'Tem certeza de que deseja excluir sua conta?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete('/auth/perfil');
                            await AsyncStorage.removeItem('user');
                            Alert.alert('Sucesso', 'Conta excluída com sucesso!');
                            router.replace('/auth/login');
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível excluir a conta.');
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Editar Perfil</Text>

            <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <TouchableOpacity onPress={pickImage}>
                    <Image
                        source={
                            fotoPerfil
                                ? { uri: fotoPerfil }
                                : require('../../assets/images/profile_default.jpeg')
                        }
                        style={styles.image}
                    />
                    <View style={styles.editIconContainer}>
                        <MaterialIcons name="edit" size={28} color="#fff" />
                    </View>
                </TouchableOpacity>
            </View>

            <TextInput
                style={styles.input}
                placeholder="Nome"
                value={nome}
                onChangeText={setNome}
            />

            <TextInput
                style={styles.input}
                placeholder="E-mail"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                style={styles.input}
                placeholder="Telefone"
                keyboardType="phone-pad"
                value={telefone}
                onChangeText={(text) => setTelefone(formatPhone(text))}
            />

            <TouchableOpacity style={styles.button} onPress={handleSave} disabled={uploading}>
                {uploading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                    <Text style={styles.buttonText}>Salvar Alterações</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeleteAccount}>
                <Text style={styles.buttonText}>Excluir Conta</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f5f6',
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1f1f1f',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        width: '100%',
        height: 52,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#d0d0d0',
        fontSize: 15,
    },
    button: {
        backgroundColor: '#4A44C6',
        paddingVertical: 14,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    deleteButton: {
        backgroundColor: '#FF4C4C',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
    },
    imagePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    imagePlaceholderText: {
        color: '#a0a0a0',
        fontSize: 14,
        fontWeight: '500',
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#4A44C6',
        borderRadius: 16,
        padding: 4,
        borderWidth: 2,
        borderColor: '#fff',
    },
});


export default EditProfile;