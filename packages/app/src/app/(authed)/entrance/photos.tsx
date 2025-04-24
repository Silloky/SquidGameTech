import { Colors } from "@/constants/Colors";
import { StyleSheet, Text, View, TouchableOpacity, Button, TextInput, ScrollView } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera"
import useDeviceStore from "@/stores/deviceStore";
import { getSocket } from "@/utils/socket";
import { useState, useEffect, useRef } from "react";
import { ServerToClientEvents, wsCodes } from "types";
import { CircleDot, Loader, TicketX } from "lucide-react-native";

export default function EntrancePhotoTaker(){

    const [toBeTaken, setToBeTaken] = useState([] as { number: number, name: string }[]) 
    const [currentPlayer, setCurrentPlayer] = useState({number: 0, name: ''})
    const [invalidNumber, setNumberInvalidity] = useState(false)
    const device = useDeviceStore()
    const camera = useRef<CameraView>(null)
    const manualInput = useRef<TextInput>(null)

    useEffect(() => {
        device.modifyPurposes(device.purposes.concat('entrance-photographer'))
    }, []) 

    const socket = getSocket()!

    useEffect(() => {
        const handleConnected = () => {
            device.modifyPurposes(device.purposes.concat('entrance-photographer'))
        }
        const handlePresenceValidation = (data: Parameters<ServerToClientEvents['entrance.presenceValidation']>['0']) => {
            setToBeTaken(prev => {
                const alreadyExists = prev.some(item => item.number === data.number);
                if (alreadyExists) { return prev; };
                return [...prev, data];
            });
        }
        const handlePhotoTaken = (data: Parameters<ServerToClientEvents['entrance.photoTaken']>['0']) => {
            setToBeTaken(prev => prev.filter(item => item.number != data))
        }

        socket.on('connected', handleConnected)
        socket.on('entrance.presenceValidation', handlePresenceValidation)
        socket.on('entrance.photoTaken', handlePhotoTaken)

        return () => {
            socket.off('connected', handleConnected)
            socket.off('entrance.presenceValidation', handlePresenceValidation)
            socket.off('entrance.photoTaken', handlePhotoTaken)
        }
    }, [socket, device])

    const [permission, requestPermission] = useCameraPermissions()
    if (!permission){
        return (
            <View style={styles.container}></View>
        )
    }
    if (!permission.granted){
        <View style={styles.container}>
            <Text>We need your permission to show the camera</Text>
            <Button onPress={requestPermission} title="grant permission" />
        </View>
    }

    async function handleManualInput(input: string){
        if (input == ''){
            setNumberInvalidity(false)
            return
        }
        if (!input.match(/\d{1,3}/)){
            setNumberInvalidity(true)
            return
        }
        const number = Number.parseInt(input)
        const response = await socket.emitWithAck('entrance.checkExistence', number)
        if (response.code == wsCodes.SUCCESS) {
            setNumberInvalidity(false)
            setCurrentPlayer({ number, name: response.name })
        } else {
            setNumberInvalidity(true)
        }
    }

    function handleCrumbInput(number: number){
        setNumberInvalidity(false)
        setCurrentPlayer({ number, name: toBeTaken.find(item => item.number == number)!.name })
    }

    async function handleShutterPress(){
        if (currentPlayer.number != 0){
            const picture = await camera.current!.takePictureAsync({
                base64: true,
                quality: 0,
                shutterSound: false
            })
            socket.emitWithAck('entrance.putPhoto', {num: currentPlayer.number, photo: picture!.base64!}).then((response) => {
                if (response.code == wsCodes.SUCCESS){
                    setCurrentPlayer({number: 0, name: ''})
                    manualInput.current!.clear()
                    setNumberInvalidity(false)
                    setToBeTaken(prev => prev.filter(item => item.number != currentPlayer.number))
                } else {
                    handleShutterPress()
                }
            })
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Take Photos</Text>
            <View style={styles.body}>
                <CameraView style={styles.cameraView} flash="on" ref={camera} facing="back">
                    <TouchableOpacity style={styles.shutter} onPress={handleShutterPress}>
                        <CircleDot size={60} color={Colors.cream}/>
                    </TouchableOpacity>
                </CameraView>
                <View style={styles.underneathWrapper}>
                    <View style={styles.choice}>
                        <View style={{...styles.listOfPendingWrapper, ...styles.bottomBox}}>
                            <ScrollView contentContainerStyle={styles.pendingGrid} scrollEnabled={true}>
                                {toBeTaken.map(player => {
                                    return (
                                        <Text 
                                            key={player.number} 
                                            style={styles.pendingNumber} 
                                            onPress={() => handleCrumbInput(player.number)}
                                        >
                                            {player.number.toString().padStart(3, '0')}
                                        </Text>
                                    )
                                })}
                            </ScrollView>
                        </View>
                        <View style={{...styles.manualEnter, ...styles.bottomBox}}>
                            <TextInput 
                                placeholder="Number"
                                onChangeText={(data) => handleManualInput(data)}
                                style={styles.manualInput}
                                ref={manualInput}
                            />
                        </View>
                    </View>
                    {currentPlayer.number == 0 ? (
                        <View style = {{...styles.currentIndicator, ...styles.bottomBox}}>
                            <Loader color={Colors.cream} size={40}/>
                            <Text style={styles.infoText}>Choose player</Text>
                        </View>
                    ) : (
                        !invalidNumber ? (
                            <View style={{ ...styles.currentIndicator, ...styles.bottomBox }}>
                                <Text style={{...styles.infoText, fontSize: 50}}>{currentPlayer.number}</Text>
                                <Text style={styles.playerName}>
                                    {currentPlayer.name.split(' ')[0]}
                                    {"\n"}
                                    {currentPlayer.name.split(' ').slice(1).join(' ')}
                                </Text>
                            </View>
                        ) : (
                            <View style={{...styles.currentIndicator, ...styles.bottomBox}}>
                                <TicketX size={40} color={Colors.cream} />
                                <Text style={styles.infoText}>Invalid ticket</Text>
                            </View>
                        )
                    ) }
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
        width: "100%"
        //margin: 10
    },
    cameraView: {
        borderRadius: 25,
        borderColor: "white",
        borderWidth: 1,
        height: "50%",
        width: "100%",
        position: "relative"
    },
    shutter: {
        position: "absolute",
        bottom: 10,
        textAlign: "center",
        left: 0,
        right: 0,
        margin: "auto",
        display: "flex",
        alignItems: "center",
    },
    underneathWrapper: {
        height: "40%",
        display: "flex",
        maxWidth: 500,
        width: "100%",
        gap: 15,
        flexDirection: "row"
    },
    bottomBox: {
        backgroundColor: Colors.murrey,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.cream
    },
    choice: {
        height: "100%",
        width: "50%",
        display: "flex",
    },
    listOfPendingWrapper: {
        height: "70%",
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        padding: 15,
    },
    pendingGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        gap: 10,
        
    },
    pendingNumber: {
        paddingTop: 5,
        paddingBottom: 5,
        paddingRight: 11,
        paddingLeft: 11,
        borderRadius: 40,
        backgroundColor: Colors.bronze,
        color: Colors.cream,
        fontFamily: "Oxanium_400Regular",
        fontSize: 22,
        textAlignVertical: "center",
    },
    manualEnter: {
        height: "30%",
        padding: 15,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0
    },
    manualInput: {
        backgroundColor: Colors.rose,
        borderRadius: 4,
        padding: 10,
        fontSize: 17,
        width: "100%",
        height: "100%"
    },
    currentIndicator: {
        height: "100%",
        flexGrow: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    infoText: {
        color: Colors.cream,
        fontFamily: "Oxanium_400Regular",
        fontSize: 17,
        padding: 10,
        flexWrap: "wrap",
    },
    playerName: {
        color: Colors.cream,
        fontFamily: "Oxanium_400Regular",
        fontSize: 20,
        textAlign: "center",
        alignSelf: "center",
    }
})