import useStaffStore from '@/stores/staffStore';
import { Redirect, Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  const staff = useStaffStore()
  if (!staff.isLoggedIn) {
    return <Redirect href="/login" />
  }

  return (
    <Stack screenOptions={{
      headerShown: false,
      animation: 'slide_from_right'
    }}/>
  );
}
