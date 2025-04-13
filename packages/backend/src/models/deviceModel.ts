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
    user: { type: String, required: true },
    userName: { type: String, required: true },
})
devicesSchema.virtual("id").get(function () {
    return this._id.toHexString()
})

devicesSchema.set("toJSON", {
    virtuals: true,
    transform: (doc, ret, options) => {
        delete ret._id
        delete ret.__v
    },
})

const DevicesModel = mongoose.model<Device>("staff", devicesSchema)

export default DevicesModel