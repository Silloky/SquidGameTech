import { RawStaffMember } from "@silloky-squidgame/types"
import mongoose from "mongoose"

const staffSchema = new mongoose.Schema<RawStaffMember>({
    _id: { type: String, required: true },
    roles: { type: [String], required: true, ref: "roles" },
    grantedPermissions: { type: [String], required: true },
    deniedPermissions: { type: [String], required: true },
    online: { type: Boolean, required: true },
})
staffSchema.virtual("id").get(function () {
    return this._id
})

staffSchema.set("toJSON", {
    virtuals: true,
    transform: (doc, ret, options) => {
        delete ret._id
        delete ret.__v
    },
})

const StaffModel = mongoose.model<RawStaffMember>("staff", staffSchema)

export default StaffModel