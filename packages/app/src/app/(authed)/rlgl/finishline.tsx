import { Colors } from "@/constants/Colors";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from "react-native";
import { Check, Undo2, Loader, Plus } from "lucide-react-native";
import { getSocket } from "@/utils/socket";
import { wsCodes } from "types";
import { Circle } from "react-native-svg";
import useDeviceStore from "@/stores/deviceStore";

export default function NewOrLost() {

    const [gameStarted, setGameStarted] = useState(false)
    const socket = getSocket()!

    const device = useDeviceStore()
    useEffect(() => {
        device.modifyPurposes(device.purposes.concat('rlgl-finisher'))
    }, []) 

    const gameEvents = {
        'games.rlgl.start': () => setGameStarted(true),
        'games.rlgl.stop': () => setGameStarted(false),
        'games.rlgl.rl': () => setGameStarted(true),
        'games.rlgl.gl': () => setGameStarted(true),
    };
    useEffect(() => {
        (Object.entries(gameEvents) as [keyof typeof gameEvents, () => void][]).forEach(([event, handler]) => {
            socket.on(event, handler);
        });

        return () => {
            (Object.entries(gameEvents) as [keyof typeof gameEvents, () => void][]).forEach(([event, handler]) => {
                socket.off(event, handler);
            });
        };
    }, []);
    
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Finish Line</Text>
            <View style={styles.body}>
                {gameStarted ? (
                    <View style={styles.form}>
                        <TouchableOpacity style={styles.validateButton} onPress={() => {socket.emitWithAck('games.rlgl.playerFinished', null).then(() => {})}}>
                            <Plus color={Colors.murrey} size={26} />
                            <Text style={styles.buttonText}>Validate new finish</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.form}>
                        <Loader color={Colors.cream} size={40} />
                        <Text style={styles.hasntStarted}>Waiting for game to start...</Text>
                    </View>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.dogwood,
        height: "100%",
        display: "flex",
        gap: 20,
        alignItems: "center",
        justifyContent: 'space-evenly'
    },
    header: {
        fontFamily: "BrunoAceSC_400Regular",
        color: "white",
        textAlign: "center",
        fontSize: 26,
        marginTop: 20
    },
    body: {
        display: "flex",
        width: "100%",
        alignItems: "center",
        height: "90%",
        justifyContent: "center",
    },
    form: {
        backgroundColor: Colors.murrey,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: Colors.cream,
        padding: 30,
        height: "30%",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        maxWidth: 400
    },
    hasntStarted: {
        color: Colors.cream,
        fontFamily: "Oxanium_400Regular",
        fontSize: 20,
        textAlign: "center",
        width: "100%"
    },
    inputLabel: {
        color: Colors.cream,
        fontFamily: "Oxanium_400Regular",
        fontSize: 20,
        marginBottom: 10,
    },
    validateButton: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        backgroundColor: Colors.rose,
        padding: 15,
        borderRadius: 20,
        justifyContent: "space-around",
    },
    buttonText: {
        color: Colors.murrey,
        fontFamily: "Oxanium_400Regular",
        fontSize: 20,
    },
})