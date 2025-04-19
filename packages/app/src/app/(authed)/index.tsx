import { Text, View, Button, StyleSheet } from "react-native";
import useStaffStore from "@/stores/staffStore";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useEffect } from "react";

export default function Index() {;
  const { logout, name } = useStaffStore();

  useEffect(() => {}, [useStaffStore(state => state.permissions)]);

  // if (!name){
  //   return (
  //     <Text>Loading...</Text>
  //   )
  // }

  return (
    <View style={styles.container}>
      <Text>Welcome {name}</Text>
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
