import useStaffStore from '@/stores/staffStore';
import { Redirect, Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
    const isLoggedIn = useStaffStore(state => state.isLoggedIn)

    if (!isLoggedIn) {
        return <Redirect href="/login" />
    }

    return (
        <Stack screenOptions={{
            headerShown: false,
            animation: 'slide_from_right'
        }} />
    );
}
