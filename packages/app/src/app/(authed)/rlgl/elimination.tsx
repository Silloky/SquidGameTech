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
    const [targetEliminations, setTargetEliminations] = useState(0)
    const [eliminations, setEliminations] = useState(0)

    const [playerNumber, setPlayerNumber] = useState(0)
    const socket = getSocket()!

    const numberInput = useRef<TextInput>(null)

    const device = useDeviceStore()
    useEffect(() => {
        device.modifyPurposes(device.purposes.concat('rlgl-eliminator'))
    }, []) 

    const gameEvents = {
        'games.rlgl.start': () => setGameStarted(true),
        'games.rlgl.stop': () => setGameStarted(false),
        'games.rlgl.rl': (target: number) => {
            setGameStarted(true)
            setTargetEliminations(target)
            setGameState('rl')
        },
        'games.rlgl.gl': () => {
            setGameStarted(true)
            setTargetEliminations(0)
            setGameState('gl')
        },
        'players.eliminated': () => {
            setEliminations(eliminations => eliminations - 1)
            setTargetEliminations(targetEliminations => targetEliminations - 1)
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

    function validateElimination() {
        socket.emitWithAck('players.eliminate', playerNumber).then((res) => {
            if (res.code == wsCodes.SUCCESS) {
                setEliminations(eliminations + 1)
                setTargetEliminations(targetEliminations - 1)
                numberInput.current?.clear()
            } else if (res.code == wsCodes.NO_ACTION){
                numberInput.current?.clear()
            }
        })
    }
    
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Eliminations</Text>
            <View style={styles.body}>
                <View style={{...styles.gameStatus, ...styles.pageSection}}>
                    {gameStarted ? (
                        <>
                            <View style={styles.lightsWrapper}>
                                <View style={[styles.statusCircle, styles.greenCircle, gameState == 'gl' && styles.activeStatusLight]} />
                                <View style={[styles.statusCircle, styles.redCircle, gameState == 'rl' && styles.activeStatusLight]} />
                            </View>
                            <Text style={styles.elimTarget}>Eliminations target : {targetEliminations}</Text>
                        </>
                    ) : (
                        <>
                            <Loader color={Colors.cream} size={40} />
                            <Text style={styles.hasntStarted}>Waiting for game to start...</Text>
                        </>
                    )}
                </View>

                <View style={[styles.pageSection, {opacity: gameState == 'gl' ? 0.5 : 1}, {display: gameStarted ? 'flex' : 'none'}]} pointerEvents={gameState === 'gl' ? 'none' : 'auto'}>
                    <Text style={styles.inputLabel}>Player Number</Text>
                    <TextInput
                        placeholder=""
                        style={styles.input}
                        inputMode="numeric"
                        onChangeText={(data) => setPlayerNumber(Number.parseInt(data))}
                        autoCorrect={false}
                        ref={numberInput}
                    />
                    <TouchableOpacity style={styles.validateButton} onPress={validateElimination}>
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
    inputSectionContainer: {
        width: "90%",
        maxWidth: 400,
        position: 'relative',
    },
})