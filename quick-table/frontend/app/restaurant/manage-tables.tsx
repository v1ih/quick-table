import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, BackHandler, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Title, Button, Paragraph, Card } from 'react-native-paper';
import api from '../../services/api';

type Table = {
    id: number;
    numero: string;
    capacidade: string;
    descricao: string;
    disponivel: boolean;
};

const ManageTables = () => {
    const [tables, setTables] = useState<Table[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const response = await api.get('/mesas');
                setTables(response.data);
            } catch (error) {
                Alert.alert('Erro', 'Não foi possível carregar as mesas.');
            }
        };

        fetchTables();
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

    const handleDeleteTable = async (id: number) => {
        Alert.alert(
            'Confirmação',
            'Tem certeza de que deseja excluir esta mesa?',
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
                            await api.delete(`/mesas/${id}`);
                            Alert.alert('Sucesso', 'Mesa excluída com sucesso!');
                            const response = await api.get('/mesas'); // Recarregar as mesas
                            setTables(response.data);
                        } catch (error) {
                            Alert.alert('Erro', 'Erro ao excluir mesa.');
                        }
                    },
                },
            ]
        );
    };

    const handleEditTable = (id: number) => {
        router.push(`/restaurant/edit-table?id=${id}`);
    };

    const handleAddTable = () => {
        router.push('/restaurant/add-table');
    };

    const renderItem = ({ item }: { item: Table }) => (
        <Card style={styles.tableItem}>
            <Card.Content>
                <Paragraph style={styles.tableText}>Mesa {item.numero}</Paragraph>
                <Paragraph style={styles.tableText}>Capacidade: {item.capacidade}</Paragraph>
                <Paragraph style={styles.tableText}>Descrição: {item.descricao}</Paragraph>
                <Paragraph style={styles.tableText}>Status: {item.disponivel ? 'Disponível' : 'Indisponível'}</Paragraph>
                <View style={styles.actionButtons}>
                    <Button
                        mode="contained"
                        style={styles.editButton}
                        onPress={() => handleEditTable(item.id)}
                        labelStyle={styles.buttonText}
                    >
                        Editar
                    </Button>
                    <Button
                        mode="contained"
                        style={styles.deleteButton}
                        onPress={() => handleDeleteTable(item.id)}
                        labelStyle={styles.buttonText}
                    >
                        Excluir
                    </Button>
                </View>
            </Card.Content>
        </Card>
    );

    return (
        <View style={styles.container}>
            <Title style={styles.title}>Gerenciar Mesas</Title>
            <Button
                mode="contained"
                style={styles.addButton}
                onPress={handleAddTable}
                labelStyle={styles.buttonText}
            >
                Cadastrar Nova Mesa
            </Button>
            {tables.length === 0 ? (
                <Paragraph style={styles.noTablesText}>Nenhuma mesa cadastrada.</Paragraph>
            ) : (
                <FlatList
                    data={tables}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                />
            )}
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
        fontWeight: '700',
        textAlign: 'center',
        color: '#0f0f0f',
        marginBottom: 20,
    },
    addButton: {
        backgroundColor: '#4A44C6',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    tableItem: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 18,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    tableText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 6,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    editButton: {
        backgroundColor: '#FDBF36',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        flex: 1,
        marginRight: 6,
        alignItems: 'center', // Centralize text horizontally
        justifyContent: 'center', // Centralize text vertically
    },
    deleteButton: {
        backgroundColor: '#FF4C4C',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        flex: 1,
        marginLeft: 6,
        alignItems: 'center', // Centralize text horizontally
        justifyContent: 'center', // Centralize text vertically
    },
    noTablesText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 24,
        color: '#777',
    },
});


export default ManageTables;