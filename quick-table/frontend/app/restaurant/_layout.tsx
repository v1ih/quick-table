import { Stack } from 'expo-router';
import React from 'react';

const Layout = () => {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="register-restaurant" />
            <Stack.Screen name="manage-tables" />
            <Stack.Screen name="add-table" />
            <Stack.Screen name="edit-table" />
        </Stack>
    );
};

export default Layout;