import { Colors } from "@/constants/Colors";
import { StyleSheet, Text, View, TouchableOpacity, Button } from "react-native";
import { useState, useEffect } from "react";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera"
import md5 from 'js-md5'
import { getSocket } from "@/utils/socket";
import { wsCodes } from "types";
import { Loader, TicketX, ShieldCheck } from "lucide-react-native";

export default function VerifyTicketPage() {

    const [hasRead, setReadStatus] = useState(false)
    const [number, setNumber] = useState('')
    const [validTicket, setTicketValidity] = useState(true)
    const [playerName, setPlayerName] = useState('')

    useEffect(() => {
        if (hasRead && !validTicket) {
            const timeout = setTimeout(() => {
                cleanUpCurrent()
            }, 1500) // 1.5 seconds, adjust as needed
            return () => clearTimeout(timeout)
        }
    }, [hasRead, validTicket])

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

    const socket = getSocket()!

    async function onCodeScan(scannedNumber: string){
        if (!hasRead){
            setReadStatus(true)
            try {
                setPlayerName((await verifyTicket(scannedNumber))!)
                setTicketValidity(true)
            } catch {
                setTicketValidity(false)
            }
        }
    }

    function extractCode(scannedNumber: string){
        var parts = /(\d{3})([a-z\d]{32})/gm.exec(scannedNumber)
        if (parts) {
            const number = parts[1]
            if (parts[2] == md5.md5(number)) {
                setNumber(number)
                return Number.parseInt(number)
            } else { throw '' }
        } else {
            throw ''
        }
    }

    async function verifyTicket(scannedNumber: string) {
        let number: number;
        try {
            number = extractCode(scannedNumber)
            const response = await socket.emitWithAck('entrance.checkExistence', number)
            if (response.code == wsCodes.NOT_FOUND){throw ''} else if (response.code == wsCodes.SUCCESS){
                return response.name
            }
        } catch {throw ''}
    }

    function cleanUpCurrent(){
        setReadStatus(false)
        setTicketValidity(true)
        setPlayerName('')
        setNumber('')
    }

    async function validatePlayer(){
        const response = await socket.emitWithAck('entrance.validatePresence', Number.parseInt(number))
        if (response.code != wsCodes.SUCCESS && response.code != wsCodes.NO_ACTION){
            console.log(response)
        } else {cleanUpCurrent()}
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Ticket Validator</Text>
            <View style={styles.body}>
                <CameraView
                    barcodeScannerSettings={{barcodeTypes: ['pdf417']}}
                    onBarcodeScanned={(data) => onCodeScan(data.data)}
                    style={styles.cameraPreview}
                ></CameraView>
                {hasRead ?
                    (validTicket ? (
                        <View style={styles.infoBox}>
                            <Text style={{...styles.infoLabel, fontSize: 32}}>{playerName}</Text>
                            <TouchableOpacity style={styles.confirmButton} onPress={() => validatePlayer() }>
                                <ShieldCheck color={Colors.dogwood} />
                                <Text style={styles.buttonText}>Confirm entrance</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.infoBox}>
                            <TicketX size={40} color={Colors.cream}/>
                            <Text style={styles.infoLabel}>Invalid ticket</Text>
                        </View>
                    )
                ) : (
                    <View style={styles.infoBox}>
                        <Loader color={Colors.cream} size={40} />
                        <Text style={styles.infoLabel}>Waiting for scan</Text>
                    </View>
                )}
            </View>
        </View>
    )
}

export const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.dogwood,
        height: "100%",
        display: "flex",
        gap: 20,
        alignItems: "center",
        justifyContent: 'space-evenly',
        flexGrow: 1
    },
    header: {
        fontFamily: "BrunoAceSC_400Regular",
        color: "white",
        fontSize: 26,
        marginTop: 20
    },
    body: {
        display: "flex",
        flexGrow: 1,
        width: "100%",
        alignContent: "center",
        gap: 30
    },
    cameraPreview: {
        borderRadius: 25,
        borderColor: "white",
        borderWidth: 1,
        height: "50%",
        width: "100%",
    },
    infoBox: {
        width: "100%",
        backgroundColor: Colors.murrey,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: Colors.cream,
        padding: 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-evenly",
        height: "35%"
    },
    infoLabel: {
        color: Colors.cream,
        fontFamily: "Oxanium_400Regular",
        fontSize: 20
    },
    confirmButton: {
        display: "flex",
        width: "90%",
        flexDirection: "row",
        padding: 15,
        backgroundColor: Colors.rose,
        justifyContent: "space-evenly",
        alignItems: "center",
        borderRadius: 25,
        borderColor: Colors.cream,
        marginTop: 30,
        borderWidth: 1
    },
    buttonText: {
        color: Colors.dogwood,
        fontSize: 20
    }
})