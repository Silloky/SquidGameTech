import { ClientToServerEvents, ServerSocketAug, ServerToClientEvents, wsCodes } from "types";
import { Device } from "types";
import DevicesModel from "../models/deviceModel";
import typia from "typia";

const addDevice: ClientToServerEvents['devices.add'] = async (socket: ServerSocketAug, device: Device) => {
    let newDevice;

    device.live = true;
    device.username = socket.data.user.username!;
    device.id = device.device.toLowerCase().replace(/\s/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    
    if (!device.id) {
        newDevice = (await DevicesModel.insertOne(device))!
    } else {
        newDevice = (await DevicesModel.findOneAndUpdate({ id: device.id }, device, { new: true, upsert: true }))!
    }
    socket.emit('devices.add.confirm', wsCodes.SUCCESS, newDevice.toJSON())
}

const logoffDevice: ClientToServerEvents['devices.logoff'] = async (socket: ServerSocketAug, deviceId: Device['device']) => {
    const oldDoc = await DevicesModel.findOneAndUpdate({ id: deviceId }, {live: false})
    socket.emit('devices.logoff.confirm', oldDoc ? wsCodes.SUCCESS : wsCodes.NO_ACTION)
}

const modifyPurposes: ClientToServerEvents['devices.modifyPurposes'] = async (socket: ServerSocketAug, deviceId: Device['device'], newPurposes: Device['purposes']) => {
    const oldDoc = await DevicesModel.findOneAndUpdate({ id: deviceId }, { purposes: newPurposes })
    socket.emit('devices.modifyPurposes.confirm', oldDoc ? wsCodes.SUCCESS : wsCodes.NO_ACTION)
}

const removeDevice: ClientToServerEvents['devices.remove'] = async (socket: ServerSocketAug, deviceId: Device['device']) => {
    const oldDoc = await DevicesModel.findOneAndDelete({ id: deviceId })
    socket.emit('devices.remove.confirm', oldDoc ? wsCodes.SUCCESS : wsCodes.NO_ACTION)
}

export default async function deviceHandler(socket: ServerSocketAug, event: keyof ClientToServerEvents, data: Device | Device['device'] | {device: Device['device'], newPurposes: Device['purposes']}) {
    
    try {

        if (event == 'devices.add'){
            
            if (typia.is<(ClientToServerEvents['devices.add'] extends (socket: ServerSocketAug, device: infer T) => void ? T : never)>(data)){
                addDevice(socket, data)
            } else {throw ''}

        } else if (event == 'devices.logoff'){

            if (typia.is<(ClientToServerEvents['devices.logoff'] extends (socket: ServerSocketAug, device: infer T) => void ? T : never)>(data)) {
                logoffDevice(socket, data)
            } else { throw '' }

        } else if (event == "devices.remove"){

            if (typia.is<(ClientToServerEvents['devices.remove'] extends (socket: ServerSocketAug, device: infer T) => void ? T : never)>(data)){
                removeDevice(socket, data)
            } else {throw ''}

        } else if (event == 'devices.modifyPurposes'){

            if (typia.is<{ device: ((ClientToServerEvents['devices.modifyPurposes'] extends (socket: ServerSocketAug, device: infer T, newPurposes: infer S) => void ? T : never)), newPurposes: ((ClientToServerEvents['devices.modifyPurposes'] extends (device: infer T, newPurposes: infer S) => void ? S : never)) }>(data)){
                modifyPurposes(socket, data.device, data.newPurposes)
            } else {throw ''}
        
        }

    } catch (e) {
        socket.emit(event + '.confirm' as keyof ServerToClientEvents, wsCodes.INVALID_MESSAGE, {} as Device)
    }
}
