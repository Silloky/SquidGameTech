import { Text, View, Button, StyleSheet } from "react-native";
import useStaffStore from "@/stores/staffStore";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import useDeviceStore from "@/stores/deviceStore";
import { useEffect } from "react";

export default function Index() {;
  const { isLoggedIn, logout } = useStaffStore();

  useEffect(() => {}, [useStaffStore(state => state.permissions)]);

  return (
    <View style={styles.container}>
      <Text>Welcome to the Staff App</Text>
      <Button title="Logout" onPress={() => logout()} />
      <Button title="Dog" onPress={() => router.push('/dog')}/>
      <Text>{JSON.stringify(useStaffStore.getState().permissions)}</Text>
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
