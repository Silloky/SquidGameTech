import { Colors } from "@/constants/Colors";
import { StyleSheet, Text, View } from "react-native";

export default function Dog() {
    return (
        <View style={styles.container}>
            <Text>Dog</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.dogwood,
        height: "100%",
    }
})