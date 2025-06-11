import { Stack } from 'expo-router';
import React from 'react';

const Layout = () => {
    return (
        <Stack>
            <Stack.Screen name="manage-tables" options={{ title: 'Gerenciar Mesas' }} />
            <Stack.Screen name="add-table" options={{ title: 'Adicionar Mesa' }} />
            <Stack.Screen name="edit-table" options={{ title: 'Editar Mesa' }} />
        </Stack>
    );
};

export default Layout;