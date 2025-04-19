import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useFonts, BrunoAceSC_400Regular } from '@expo-google-fonts/bruno-ace-sc';
import useStaffStore from '../stores/staffStore';
import { RestResError } from '../utils/rest';
import { Href, useRouter } from 'expo-router';

export default function Login() {
    const { login } = useStaffStore();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleSubmit = async () => {
        login(username.trim(), password.trim())
            .then(() => {
                setUsername(() => '');
                setPassword(() => '');
                router.replace('/' as Href)
            })
            .catch((error: RestResError) => {
                Alert.alert('Error', error.error);
            });
    };

    let [fontsLoaded] = useFonts({
        BrunoAceSC_400Regular,
    });
    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Staff Login</Text>
            <View style={styles.form}>
                <TextInput
                    placeholder="Nom d'utilisateur"
                    style={styles.input}
                    onChangeText={(data) => setUsername(data)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={username}
                />
                <TextInput
                    placeholder="Mot de passe"
                    secureTextEntry
                    style={styles.input}
                    onChangeText={(data) => setPassword(data)}
                    autoCapitalize='none'
                    autoCorrect={false}
                    value={password}
                />
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#D81B60'
    },
    title: {
        fontSize: 32,
        color: '#fff',
        marginBottom: 20,
        fontFamily: "BrunoAceSC_400Regular",
    },
    form: {
        width: 300,
        backgroundColor: '#880E4F',
        padding: 20,
        borderRadius: 8
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 4,
        padding: 10,
        marginBottom: 10
    },
    button: {
        backgroundColor: '#E91E63',
        borderRadius: 4,
        padding: 15,
        alignItems: 'center'
    },
    buttonText: {
        color: '#fff'
    }
});
