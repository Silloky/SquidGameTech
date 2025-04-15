import { Text, View, Button, StyleSheet } from "react-native";
import useStaffStore from "@/stores/staffStore";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";

export default function Index() {
  const staff = useStaffStore();
  const { isLoggedIn, logout } = staff;

  return (
    <View style={styles.container}>
      <Text>Welcome to the Staff App</Text>
      <Button title="Logout" onPress={() => logout()} />
      <Button title="Dog" onPress={() => router.push('/dog')}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: Colors.dogwood,
    height: "100%",
  }
});
