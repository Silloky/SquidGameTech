import { ClientToServerEvents, ServerSocketAug, wsCodes } from "types";
import { Device } from "types";
import DevicesModel from "../models/deviceModel";
import typia from "typia";

const addDevice = async (data: Device, ack: (response: { code: number; data: (Device & { username: string }) }) => void) => {
    data.live = true;
    if (data.device){
        data.id = data.device.toLowerCase().replace(/\s/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }
    if (!data.id) {
        data.id = Math.random().toString(36).substring(2, 8);
    }
    const newDevice = (await DevicesModel.findOneAndUpdate({ 
        $or: [
            {
                id: data.id,
            }, 
            {
                $and: [{device: data.device}, {osVersion: data.osVersion}]
            }
        ]
    }, data, { new: true, upsert: true }))!;
    ack({ code: wsCodes.SUCCESS, data: newDevice.toJSON() });
};

// const logoffDevice = async (deviceId: Device['device'], ack: (response: { code: number; }) => void) => {
//     const oldDoc = await DevicesModel.findOneAndUpdate({ id: deviceId }, { live: false });
//     ack({ code: oldDoc ? wsCodes.SUCCESS : wsCodes.NO_ACTION });
// };

const modifyPurposes = async (data: { deviceId: Device['device'], newPurposes: Device['purposes'] }, ack: (response: { code: number; }) => void) => {
    const oldDoc = await DevicesModel.findOneAndUpdate({ id: data.deviceId }, { purposes: data.newPurposes });
    ack({ code: oldDoc ? wsCodes.SUCCESS : wsCodes.NO_ACTION });
};

const removeDevice = async (deviceId: Device['device'], ack: (response: { code: number; }) => void) => {
    const oldDoc = await DevicesModel.findOneAndDelete({ id: deviceId });
    ack({ code: oldDoc ? wsCodes.SUCCESS : wsCodes.NO_ACTION });
};

export default async function deviceHandler(event: keyof ClientToServerEvents, data: any, socket: ServerSocketAug, ack: any) {

    try {
        if (event == 'devices.add') {
            if (typia.is<(ClientToServerEvents['devices.add'] extends (data: infer T, ack: any) => void ? T : never)>(data)) {
                (data as (Device & {username: string})).username = socket.data.user.username!
                socket.data.device = data
                addDevice(data, ack)
            } else {
                ack({ code: wsCodes.INVALID_MESSAGE })
            }
        // } else if (event == 'devices.logoff') {
        //     if (typia.is<(ClientToServerEvents['devices.logoff'] extends (data: infer T, ack: any) => void ? T : never)>(data)) {
        //         logoffDevice(data, ack);
        //     } else {
        //         ack({ code: wsCodes.INVALID_MESSAGE })
        //     }
        } else if (event == "devices.remove") {
            if (typia.is<(ClientToServerEvents['devices.remove'] extends (data: infer T, ack: any) => void ? T : never)>(data)) {
                removeDevice(data, ack)
            } else {
                ack({ code: wsCodes.INVALID_MESSAGE })
            }
        } else if (event == 'devices.modifyPurposes') {
            if (typia.is<(ClientToServerEvents['devices.modifyPurposes'] extends (data: infer T, ack: any) => void ? T : never)>(data)) {
                modifyPurposes(data, ack)
            } else {
                ack({ code: wsCodes.INVALID_MESSAGE })
            }
        }
    } catch (e) {
        ack({ code: wsCodes.SERVER_ERROR })
    }
}
