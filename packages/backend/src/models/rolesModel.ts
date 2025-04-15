import { StaffRole } from "types"
import mongoose from "mongoose"

const rolesSchema = new mongoose.Schema<StaffRole>({
    name: { type: String, required: true },
    permissions: { type: [String], required: true },
}, {collection: "roles"})
// rolesSchema.virtual("id").get(function () {
//     return this._id
// })

// rolesSchema.set("toJSON", {
//     virtuals: true,
//     transform: (doc, ret, options) => {
//         delete ret._id
//         delete ret.__v
//     },
// })

const RolesModel = mongoose.model<StaffRole>("roles", rolesSchema)

export default RolesModel