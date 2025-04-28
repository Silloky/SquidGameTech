import { Colors } from "@/constants/Colors";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from "react-native";
import { Check, Undo2, Loader } from "lucide-react-native";
import { getSocket } from "@/utils/socket";
import { wsCodes } from "types";
import useDeviceStore from "@/stores/deviceStore";

export default function NewOrLost() {

    const [gameState, setGameState] = useState<'rl' | 'gl'>('rl')
    const [gameStarted, setGameStarted] = useState(false)
    const [distance, setDistance] = useState(0)

    const socket = getSocket()!

    const numberInput = useRef<TextInput>(null)

    const device = useDeviceStore()
    useEffect(() => {
        device.modifyPurposes(device.purposes.concat('rlgl-distanceAvg'))
    }, []) 

    const gameEvents = {
        'games.rlgl.start': () => setGameStarted(true),
        'games.rlgl.stop': () => setGameStarted(false),
        'games.rlgl.rl': (target: number) => {
            setGameStarted(true)
            setGameState('rl')
        },
        'games.rlgl.gl': () => {
            setGameStarted(true)
            setGameState('gl')
        },
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

    function validateDistance() {
        socket.emitWithAck('games.rlgl.setAverageDistance', distance).then((res) => {
            if (res.code == wsCodes.SUCCESS){
                numberInput.current?.clear()
            }
        })
    }
    
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Average Distance</Text>
            <View style={styles.body}>
                <View style={{...styles.gameStatus, ...styles.pageSection}}>
                    {gameStarted ? (
                        <>
                            <View style={styles.lightsWrapper}>
                                <View style={[styles.statusCircle, styles.greenCircle, gameState == 'gl' && styles.activeStatusLight]} />
                                <View style={[styles.statusCircle, styles.redCircle, gameState == 'rl' && styles.activeStatusLight]} />
                            </View>
                        </>
                    ) : (
                        <>
                            <Loader color={Colors.cream} size={40} />
                            <Text style={styles.hasntStarted}>Waiting for game to start...</Text>
                        </>
                    )}
                </View>

                <View style={[styles.pageSection, {opacity: gameState == 'gl' ? 0.5 : 1}, {display: gameStarted ? 'flex' : 'none'}]} pointerEvents={gameState === 'gl' ? 'none' : 'auto'}>
                    <Text style={styles.inputLabel}>Average distance</Text>
                    <TextInput
                        placeholder=""
                        style={styles.input}
                        inputMode="numeric"
                        onChangeText={(data) => setDistance(Number.parseInt(data))}
                        autoCorrect={false}
                        ref={numberInput}
                    />
                    <TouchableOpacity style={styles.validateButton} onPress={validateDistance}>
                        <Check color={Colors.murrey} size={26} />
                        <Text style={styles.buttonText}>Validate</Text>
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
        justifyContent: "center",
        flexGrow: 1,
        gap: 30
    },
    pageSection: {
        width: "100%",
        maxWidth: 400,
        backgroundColor: Colors.murrey,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: Colors.cream,
        padding: 30,
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
    },
    hasntStarted: {
        color: Colors.cream,
        fontFamily: "Oxanium_400Regular",
        fontSize: 20,
        textAlign: "center",
        width: "100%"
    },
    gameStatus: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20
    },
    lightsWrapper: {
        flexDirection: "row",
        justifyContent: "space-evenly"
    },
    statusCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginHorizontal: 10,
        borderWidth: 2,
        borderColor: Colors.cream,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity: 0.5
    },
    greenCircle: {
        backgroundColor: 'green',
    },
    redCircle: {
        backgroundColor: 'red',
    },
    activeStatusLight: {
        opacity: 1
    },
    elimTarget: {
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
        alignSelf: "flex-start"
    },
    input: {
        backgroundColor: Colors.rose,
        borderRadius: 4,
        padding: 15,
        fontSize: 20,
        width: "100%"
    },
    validateButton: {
        width: "60%",
        display: "flex",
        flexDirection: "row",
        backgroundColor: Colors.rose,
        padding: 15,
        borderRadius: 20,
        justifyContent: "space-around",
        marginTop: 30
    },
    buttonText: {
        color: Colors.murrey,
        fontFamily: "Oxanium_400Regular",
        fontSize: 20,
    },
})