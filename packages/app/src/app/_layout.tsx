import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  fade: true,
  duration: 200,
})

export default function Layout() {

  NavigationBar.setBackgroundColorAsync(Colors.dogwood);
  SplashScreen.hideAsync()

  return (
    <View style={{ flex: 1, backgroundColor: Colors.dogwood }}>
      <StatusBar style="light" backgroundColor={Colors.dogwood} translucent={true} />
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <Slot />
        </SafeAreaView>
      </SafeAreaProvider>
    </View>
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dogwood,
    width: '100%',
    height: '100%',
    padding: 15
  },
});
