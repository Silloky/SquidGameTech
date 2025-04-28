import { Colors } from "@/constants/Colors";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { UserMinus, UserCheck, Ruler, Scale } from "lucide-react-native";
import { router } from "expo-router";

export default function RLGLIndex() {

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Red Light, Green Light</Text>
            <View style={styles.body}>
                <View style={{ width: "80%", maxWidth: 600, display: "flex", gap: 20}}>
                    <TouchableOpacity style={styles.section} onPress={() => router.push('/rlgl/elimination')}>
                        <UserMinus color={Colors.cream} size={40}/>
                        <Text style={styles.sectionLabel}>Elimination</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.section} onPress={() => router.push('/rlgl/finishline')}>
                        <UserCheck color={Colors.cream} size={40}/>
                        <Text style={styles.sectionLabel}>Finish line</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.section} onPress={() => router.push('/rlgl/averageDist')}>
                        <Ruler color={Colors.cream} size={40} />
                        <Text style={styles.sectionLabel}>Average distance</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.section} onPress={() => router.push('/rlgl/control')}>
                        <Scale color={Colors.cream} size={40} />
                        <Text style={styles.sectionLabel}>Game control</Text>
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
        justifyContent: "space-evenly",
        gap: 7
    },
    sectionLabel: {
        color: Colors.cream,
        fontFamily: "Oxanium_400Regular",
        fontSize: 24,
        textAlign: "center"
    }
})