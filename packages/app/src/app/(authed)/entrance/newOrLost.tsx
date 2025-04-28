import { Colors } from "@/constants/Colors";
import { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from "react-native";
import { Check, Undo2 } from "lucide-react-native";
import { getSocket } from "@/utils/socket";
import { wsCodes } from "types";

async function getNumber(name: string){
    const socket = getSocket()!
    return (await socket.emitWithAck('entrance.new', { name, here: true, alive: true })).data.num
}

export default function NewOrLost() {

    const [name, setName] = useState('')
    const [number, setNumber] = useState(0)
    
    return (
        <View style={styles.container}>
            <Text style={styles.header}>New Booking</Text>
            <View style={styles.body}>
                {number == 0 ? (
                    <View style={styles.formWrapper}>
                        <Text style={styles.inputLabel}>Full Name</Text>
                        <TextInput
                            placeholder=""
                            style={styles.input}
                            onChangeText={(data) => setName(data)}
                            autoCorrect={false}
                            value={name}
                        />
                        <TouchableOpacity style={styles.validateButton} onPress={async () => setNumber(await getNumber(name))}>
                            <Check color={Colors.murrey} size={26} />
                            <Text style={styles.buttonText}>Validate</Text>
                        </TouchableOpacity>
                    </View>
                ): (
                    <View style={styles.formWrapper}>
                        <Text style={styles.number}>{number.toString().padStart(4,"0")}</Text>
                        <TouchableOpacity style={styles.validateButton} onPress={async () => {setNumber(0); setName('')}}>
                            <Undo2 color={Colors.murrey} size={26} />
                            <Text style={styles.buttonText}>Go back</Text>
                        </TouchableOpacity>
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
        height: "90%",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        flexGrow: 1
    },
    formWrapper: {
        width: "90%",
        maxWidth: 400,
        backgroundColor: Colors.murrey,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: Colors.cream,
        padding: 30,
        display: "flex",
        alignItems: "center",
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
    number: {
        color: Colors.cream,
        fontFamily: "Oxanium_400Regular",
        fontSize: 50,
    }
})