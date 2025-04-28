import { Text, View, Button, StyleSheet, TouchableOpacity } from "react-native";
import useStaffStore from "@/stores/staffStore";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useEffect } from "react";

function MenuItem() {

  const styles = StyleSheet.create({
    menuItem: {
      padding: 10,
      backgroundColor: Colors.rose,
      borderRadius: 10,
      borderColor: Colors.cream,
      borderWidth: 1,
      width: "100%",
      fontFamily: "Oxanium_400Regular",
    },
  })

  return (
    <View style={styles.menuItem}>
      <Text>Menu Item</Text>
    </View>
  );
}

export default function Index() {;
  const { logout, name } = useStaffStore();

  useEffect(() => {}, [useStaffStore(state => state.permissions)]);
  if (!name){
    return (
      <Text>Loading...</Text>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <Text style={styles.title}>Staff Panel</Text>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Ongoing</Text>
          <MenuItem />
          <TouchableOpacity onPress={() => router.push('/(authed)/entrance')}><Text>Entrance</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(authed)/rlgl')}><Text>Red light green light</Text></TouchableOpacity>
          <MenuItem />
          <MenuItem />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Soon</Text>
          <MenuItem />
          <MenuItem />
          <MenuItem />
        </View>
      </View>
      {/* <Button title="Logout" onPress={() => logout()} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: Colors.dogwood,
    height: "100%",
  },
  wrapper: {
    width: "90%",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    marginBottom: 20,
    color: Colors.cream,
    fontFamily: "BrunoAceSC_400Regular",
  },
  section: {
    width: "100%",
    maxWidth: 400,
    display: "flex",
    flexDirection: "column",
    gap: 15,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 20,
    color: Colors.cream,
    fontFamily: "Oxanium_400Regular",
  }
});
