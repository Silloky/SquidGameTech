import { Colors } from "@/constants/Colors";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { TicketCheck, Camera, UserRoundPen } from "lucide-react-native";
import { router } from "expo-router";

export default function Entrance() {

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Entrance Manager</Text>
            <View style={styles.body}>
                <View style={{height: "80%", width: "80%", maxWidth: 600, display: "flex", gap: 20}}>
                    <TouchableOpacity style={styles.section} onPress={() => router.push('/entrance/verify')}>
                        <TicketCheck color={Colors.cream} size={50}/>
                        <Text style={styles.sectionLabel}>Verify Tickets</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.section} onPress={() => router.push('/entrance/photos')}>
                        <Camera color={Colors.cream} size={50}/>
                        <Text style={styles.sectionLabel}>Take photos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.section} onPress={() => router.push('/entrance/newOrLost')}>
                        <UserRoundPen color={Colors.cream} size={50} />
                        <Text style={styles.sectionLabel}>New Player{"\n"}Lost Number</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.dogwood,
        height: "100%",
        display: "flex",
        flexGrow: 1,
    },
    header: {
        marginTop: 20,
        fontFamily: "BrunoAceSC_400Regular",
        color: "white",
        textAlign: "center",
        fontSize: 26
    },
    body: {
        display: "flex",
        gap: 20,
        alignItems: "center",
        justifyContent: 'space-evenly',
        flexGrow: 1,
    },
    section: {
        width: "100%",
        backgroundColor: Colors.murrey,
        flexGrow: 1,
        padding: 20,
        borderColor: Colors.cream,
        borderWidth: 1,
        borderRadius: 25,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-evenly"
    },
    sectionLabel: {
        color: Colors.cream,
        fontFamily: "Oxanium_400Regular",
        fontSize: 24,
        textAlign: "center"
    }
})