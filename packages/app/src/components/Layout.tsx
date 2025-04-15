import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/Colors';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';

const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  NavigationBar.setBackgroundColorAsync(Colors.dogwood);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.dogwood }}>
      <StatusBar style="light" backgroundColor="transparent" translucent={true} />
      <SafeAreaView style={styles.container}>
        {children}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default Layout;