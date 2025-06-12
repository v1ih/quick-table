import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuth from '../../hooks/useAuth';
import HomeTabs from './HomeTabs';

const Home = () => {
    useAuth(); // Verifica se o usuário está autenticado

    const router = useRouter();

    useEffect(() => {
        router.replace('/common/profile');
    }, []);

    return null;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#f9f9fb',
    },
    logo: {
        width: 160,
        height: 160,
        marginBottom: 24,
        alignSelf: 'center',
        borderRadius: 20,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
});


export default Home;