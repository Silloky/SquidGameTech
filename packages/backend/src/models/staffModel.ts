import { InternalStaffMember } from "types"
import mongoose from "mongoose"

const staffSchema = new mongoose.Schema<InternalStaffMember>({
    username: { type: String, required: true },
    name: { type: String, required: true },
    pwdH: { type: String, required: true },
    roles: { type: [String], required: true, ref: "roles" },
    grantedPermissions: { type: [String], required: true },
    deniedPermissions: { type: [String], required: true },
    online: { type: Boolean, required: true },
}, {collection: "staff"})
// staffSchema.virtual("id").get(function () {
//     return this._id
// })

// staffSchema.set("toJSON", {
//     virtuals: true,
//     transform: (doc, ret, options) => {
//         delete ret._id
//         delete ret.__v
//         delete ret.pwdH
//         delete ret.roles
//         delete ret.grantedPermissions
//         delete ret.deniedPermissions
//     },
// })

const StaffModel = mongoose.model<InternalStaffMember>("staff", staffSchema)

export default StaffModel