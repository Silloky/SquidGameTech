import { Device } from "types"
import mongoose from "mongoose"

const devicesSchema = new mongoose.Schema<Device & {username: string}>({
    id: { type: String, required: true },
    os: { type: String },
    osVersion: { type: String },
    device: { type: String, required: true },
    deviceType: { type: String, required: true },
    purposes: { type: [String], required: true },
    live: { type: Boolean, required: true },
    username: { type: String, required: true },
}, {collection: "devices"})



const DevicesModel = mongoose.model<Device & { username: string }>("devices", devicesSchema)

export default DevicesModel