import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Test } from './components/Test';

import { StaffMember } from '@silloky-squidgame/types'

const member: StaffMember = {
  id: '1',
  name: 'John Doe',
  email: 'elias@example.com',
  phone: '123-456-7890',
  role: 'Software Engineer',
  department: 'Engineering',
  hireDate: new Date('2022-01-01'),
  salary: 60000,
}

export default function App() {
  return (
    <View style={styles.container}>
      <Text>{JSON.stringify(member)}</Text>
      <Test />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#afa',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
