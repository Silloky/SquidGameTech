import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native';
import { Test } from './components/Test';
import { Permissions, AuthReq, AuthRes, StaffState } from '@silloky-squidgame/types';
import React, { useState } from 'react';
import { create } from 'zustand';
import { post, RestResError } from './utils/rest';
import useStaffStore from './stores/staffStore';

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { isLoggedIn, login, logout } = useStaffStore();

  const handleSubmit = async () => {
    login(username, password)
      .then(() => {
        Alert.alert('Success', 'You have been successfully logged in.');
      })
      .catch((error: RestResError) => {
        Alert.alert('Error', error.error);
      });
  };

  const handleLogout = () => {
    logout();
    Alert.alert('Logged out', 'You have been successfully logged out.');
  };

  return (
    <View style={styles.container}>
      {isLoggedIn ? (
        <View>
          <Text>Welcome, {useStaffStore.getState().username}!</Text>
          <Text>{JSON.stringify(useStaffStore.getState())}</Text>
          <Button title="Logout" onPress={handleLogout} />
        </View>
      ) : (
        <>
          <Text>Login</Text>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />
          <Button title="Submit" onPress={handleSubmit} />
        </>
      )}
      <Test />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#affb18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: 200,
    backgroundColor: 'white',
  },
});
