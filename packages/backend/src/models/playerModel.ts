import { Player } from 'types'
import mongoose, { Schema } from 'mongoose'

const playersSchema = new mongoose.Schema<Player>({
    number: { type: Number, required: false },
    name: { type: String, required: true },
    photo: { type: Schema.Types.Buffer, required: false },
    alive: { type: Boolean, required: true },
    here: { type: Boolean, required: true }
}, {collection: "players"})

const PlayersModel = mongoose.model<Player>("players", playersSchema)
export default PlayersModel
