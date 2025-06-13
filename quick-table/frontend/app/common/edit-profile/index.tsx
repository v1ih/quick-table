import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, BackHandler, Image, ActivityIndicator } from 'react-native';
import { TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../services/api';
import { useRouter, usePathname, useNavigation } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';

const EditProfile = () => {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
    const [fotoPerfilLocal, setFotoPerfilLocal] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [errors, setErrors] = useState<{ nome?: string; email?: string; telefone?: string }>({});
    const [successMsg, setSuccessMsg] = useState('');
    const [showingAlert, setShowingAlert] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const navigation = useNavigation();
    const pendingActionRef = useRef<any>(null);

    // Carrega dados do usuário ao abrir a tela
    useEffect(() => {
        const fetchUserData = async () => {
            const storedUser = await AsyncStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setNome(parsedUser.nome);
                setEmail(parsedUser.email);
                setTelefone(parsedUser.telefone || '');
                if (parsedUser.fotoPerfil) {
                    const isFullUrl = parsedUser.fotoPerfil.startsWith('http');
                    const urlFinal = isFullUrl
                        ? parsedUser.fotoPerfil
                        : (api.defaults.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, '') : '') + '/' + parsedUser.fotoPerfil.replace(/\\/g, '/');
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
            if (dirty) {
                Alert.alert(
                    'Descartar alterações?',
                    'Você tem alterações não salvas. Deseja descartar ou salvar antes de sair?',
                    [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Descartar', style: 'destructive', onPress: () => router.replace('/common/(tabs)/profile') },
                        { text: 'Salvar', onPress: () => handleSave() },
                    ]
                );
                return true;
            }
            router.replace('/common/(tabs)/profile');
            return true;
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [dirty, nome, email, telefone, fotoPerfil, fotoPerfilLocal]);

    // Intercepta navegação por abas
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
            if (!dirty || showingAlert) return;
            e.preventDefault();
            pendingActionRef.current = e.data.action;
            setShowingAlert(true);
            Alert.alert(
                'Descartar alterações?',
                'Você tem alterações não salvas. Deseja descartar ou salvar antes de sair?',
                [
                    { text: 'Cancelar', style: 'cancel', onPress: () => { setShowingAlert(false); } },
                    { text: 'Descartar', style: 'destructive', onPress: () => {
                        setShowingAlert(false);
                        navigation.dispatch(pendingActionRef.current);
                    } },
                    { text: 'Salvar', onPress: async () => {
                        setUploading(true);
                        const ok = await handleSave(true);
                        setUploading(false);
                        setShowingAlert(false);
                        if (ok) navigation.dispatch(pendingActionRef.current);
                    } },
                ]
            );
        });
        return unsubscribe;
    }, [dirty, nome, email, telefone, fotoPerfil, fotoPerfilLocal, navigation, showingAlert]);

    // Formatação do telefone
    const formatPhone = (text: string) => {
        return text
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
            .slice(0, 15);
    };

    // Validação dos campos
    const validate = () => {
        const newErrors: { nome?: string; email?: string; telefone?: string } = {};
        if (!nome.trim()) newErrors.nome = 'Informe seu nome';
        if (!email.trim()) newErrors.email = 'Informe seu e-mail';
        else if (!/^([\w-.]+)@([\w-]+)\.([\w-]{2,})$/.test(email.trim())) newErrors.email = 'E-mail inválido';
        // Telefone é opcional, mas se preenchido, deve ter 15 caracteres (com máscara)
        if (telefone && telefone.replace(/\D/g, '').length < 11) newErrors.telefone = 'Telefone incompleto';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Seleciona imagem do dispositivo
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });
        if (!result.canceled) {
            setFotoPerfilLocal(result.assets[0].uri);
            setFotoPerfil(result.assets[0].uri);
            setDirty(true);
        }
    };

    // Salva todas as alterações (dados + imagem)
    const handleSave = async (silent?: boolean) => {
        if (!validate()) return false;
        setUploading(true);
        try {
            let fotoPerfilPath = null;
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
                    fotoPerfilPath = response.data.fotoPerfil;
                }
            }
            const response = await api.put('/auth/perfil', {
                nome,
                email,
                telefone,
                fotoPerfil: fotoPerfilPath || (fotoPerfil ? fotoPerfil.replace(api.defaults.baseURL + '/', '') : null),
            });
            const updatedUser = response.data.usuario;
            const fotoPerfilUrl = updatedUser.fotoPerfil
                ? api.defaults.baseURL + '/' + updatedUser.fotoPerfil.replace(/\\/g, '/')
                : null;
            setFotoPerfil(fotoPerfilUrl);
            await AsyncStorage.setItem('user', JSON.stringify({
                ...updatedUser,
                fotoPerfil: updatedUser.fotoPerfil || null
            }));
            setSuccessMsg('Perfil atualizado com sucesso!');
            setDirty(false);
            if (!silent) {
                setTimeout(() => {
                    setSuccessMsg('');
                    router.replace('/common/(tabs)/profile');
                }, 1200);
            }
            return true;
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível atualizar o perfil. Tente novamente.');
            return false;
        } finally {
            setUploading(false);
            setFotoPerfilLocal(null);
        }
    };

    // Handler para o botão salvar
    const handleSaveButton = () => { handleSave(); };

    // Exclui a conta do usuário
    const handleDeleteAccount = async () => {
        Alert.alert(
            'Confirmação',
            'Tem certeza de que deseja excluir sua conta? Esta ação não poderá ser desfeita.',
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

    // Marca dirty ao editar campos
    const onChangeNome = (t: string) => { setNome(t); setDirty(true); };
    const onChangeEmail = (t: string) => { setEmail(t); setDirty(true); };
    const onChangeTelefone = (t: string) => { setTelefone(formatPhone(t)); setDirty(true); };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Editar Perfil</Text>
            <View style={styles.avatarWrapper}>
                <TouchableOpacity onPress={pickImage}>
                    <Image
                        source={fotoPerfil ? { uri: fotoPerfil } : require('../../../assets/images/profile_default.jpeg')}
                        style={styles.image}
                    />
                    <View style={styles.editIconContainer}>
                        <MaterialIcons name="edit" size={28} color="#fff" />
                    </View>
                </TouchableOpacity>
            </View>
            <View style={styles.formCard}>
                <TextInput
                    mode="outlined"
                    style={[styles.input, errors.nome && styles.inputError]}
                    label="Nome"
                    value={nome}
                    onChangeText={onChangeNome}
                    placeholder="Seu nome completo"
                    left={<TextInput.Icon icon="account" color="#ff7a00" />}
                    theme={{ colors: { primary: '#ff7a00', background: '#fff' } }}
                    autoCapitalize="words"
                />
                {errors.nome && <Text style={styles.errorText}>{errors.nome}</Text>}
                <TextInput
                    mode="outlined"
                    style={[styles.input, errors.email && styles.inputError]}
                    label="E-mail"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={onChangeEmail}
                    placeholder="seu@email.com"
                    left={<TextInput.Icon icon="email" color="#ff7a00" />}
                    theme={{ colors: { primary: '#ff7a00', background: '#fff' } }}
                    autoCapitalize="none"
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                <TextInput
                    mode="outlined"
                    style={[styles.input, errors.telefone && styles.inputError]}
                    label="Telefone (opcional)"
                    keyboardType="phone-pad"
                    value={telefone}
                    onChangeText={onChangeTelefone}
                    placeholder="(99) 99999-9999"
                    left={<TextInput.Icon icon="phone" color="#ff7a00" />}
                    theme={{ colors: { primary: '#ff7a00', background: '#fff' } }}
                    maxLength={15}
                    autoCapitalize="none"
                    placeholderTextColor="#b0b0b0"
                />
                {errors.telefone && <Text style={styles.errorText}>{errors.telefone}</Text>}
            </View>
            {successMsg ? <Text style={styles.successText}>{successMsg}</Text> : null}
            <TouchableOpacity style={styles.button} onPress={handleSaveButton} disabled={uploading}>
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
        backgroundColor: '#fff8f2', // fundo mais suave
        alignItems: 'center',
        paddingHorizontal: 0,
        paddingTop: 32,
    },
    title: {
        fontSize: 30,
        fontWeight: '800',
        color: '#ff7a00',
        marginBottom: 16,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    avatarWrapper: {
        alignItems: 'center',
        marginBottom: 24,
        width: '100%',
    },
    image: {
        width: 140,
        height: 140,
        borderRadius: 70,
        marginBottom: 12,
        backgroundColor: '#ffe3c2',
        borderWidth: 4,
        borderColor: '#ffb366',
    },
    formCard: {
        width: '98%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 18,
        shadowColor: '#ffb366',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 2,
        marginBottom: 18,
        gap: 8,
    },
    input: {
        width: '100%',
        height: 48,
        backgroundColor: '#fff',
        borderRadius: 14,
        marginBottom: 8,
        borderWidth: 0, // remove borda extra
        fontSize: 16,
    },
    inputError: {
        borderColor: '#FF4C4C',
    },
    errorText: {
        color: '#FF4C4C',
        fontSize: 13,
        marginBottom: 4,
        marginLeft: 2,
        alignSelf: 'flex-start',
    },
    successText: {
        color: '#28A745',
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 10,
        alignSelf: 'center',
    },
    button: {
        backgroundColor: '#ff7a00',
        paddingVertical: 12,
        borderRadius: 14,
        width: '98%',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#ffb366',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 1,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    deleteButton: {
        backgroundColor: '#FF4C4C',
        marginBottom: 6,
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#ff7a00',
        borderRadius: 16,
        padding: 4,
        borderWidth: 2,
        borderColor: '#fff',
    },
});


export default EditProfile;