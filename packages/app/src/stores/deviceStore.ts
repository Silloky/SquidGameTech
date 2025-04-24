import { create } from "zustand";
import * as DeviceInfo from 'expo-device'
import { DeviceState, wsCodes } from "types";
import { getSocket } from '@/utils/socket';

const useDeviceStore = create<DeviceState>()((set) => ({
    os: DeviceInfo.osName,
    osVersion: DeviceInfo.osVersion,
    device: DeviceInfo.deviceName,
    deviceType: DeviceInfo.deviceType!.toString(),
    purposes: [],
    login: async () => {
        const socket = getSocket()
        if (socket) {
            const resp = await socket?.emitWithAck('devices.add', useDeviceStore.getState())
            if (resp.code == wsCodes.SUCCESS) {
                useDeviceStore.setState({id: resp.data.id})
            } else {
                console.log("Error adding device")
            }
        } else {
            console.log("Socket not initialized yet.")
        }
    },
    modifyPurposes: async (newPurposes) => {
        const socket = getSocket()
        const response = (await socket?.emitWithAck('devices.modifyPurposes', {deviceId: useDeviceStore.getState().device, newPurposes: newPurposes}))!
    
        if (response.code == wsCodes.SUCCESS || response.code == wsCodes.NO_ACTION) {
            useDeviceStore.setState({purposes: newPurposes})
        } else {
            console.log("Error modifying purposes")
        }
    },
    removeDevice: async () => {
        const socket = getSocket()
        socket?.emit('devices.remove', useDeviceStore.getState().device, (response => {
            if (response.code == wsCodes.SUCCESS) {
                console.log("Device removed successfully")
            } else {
                console.log("Error removing device")
            }
        }))
    }
}))

export default useDeviceStore