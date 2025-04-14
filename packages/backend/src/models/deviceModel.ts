import { Device } from "@silloky-squidgame/types"
import mongoose from "mongoose"

const devicesSchema = new mongoose.Schema<Device>({
    id: { type: String, required: true },
    os: { type: String, required: true },
    osVersion: { type: String, required: true },
    device: { type: String, required: true },
    deviceType: { type: String, required: true },
    purposes: { type: [String], required: true },
    live: { type: Boolean, required: true },
    username: { type: String, required: true },
}, {collection: "devices"})
// devicesSchema.virtual("id").get(function () {
//     return this._id.toHexString()
// })

// devicesSchema.set("toJSON", {
//     virtuals: true,
//     transform: (doc, ret, options) => {
//         delete ret._id
//         delete ret.__v
//     },
// })

const DevicesModel = mongoose.model<Device>("devices", devicesSchema)

export default DevicesModel