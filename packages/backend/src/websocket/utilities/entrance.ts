import PlayersModel from "../../models/playerModel";
import { ClientToServerEvents, ServerSocketAug, ServerAug, wsCodes, Player } from "types";
import typia from "typia";

type checkParameters = Parameters<ClientToServerEvents['entrance.checkExistence']>
const checkEntrance = async (playerNumber: checkParameters['0'], ack: checkParameters['1']) => {
    const doc = await PlayersModel.findOne({ number: playerNumber }, { upsert: false })
    if (doc){
        ack({code: wsCodes.SUCCESS, name: doc.name})
    } else {
        ack({code: wsCodes.NOT_FOUND, name: ''})
    }
}

type validateParams = Parameters<ClientToServerEvents['entrance.validatePresence']>
const validateEntrance = async (playerNumber: validateParams['0'], ack: validateParams['1'], io: ServerAug) => {
    const doc = await PlayersModel.findOneAndUpdate({number: playerNumber}, {here: true})
    if (doc){
        if (doc.here){
            ack({code: wsCodes.NO_ACTION})
        } else {
            ack({code: wsCodes.SUCCESS})
        }
        io.in('entrance-notifier').emit('entrance.presenceValidation', { number: playerNumber, name: doc.name })    
    } else {
        ack({code: wsCodes.NOT_FOUND})
    }
}

type photoParams = Parameters<ClientToServerEvents['entrance.putPhoto']>
const putPhoto = async (data: photoParams['0'], ack: photoParams['1'], io: ServerAug) => {
    const doc = await PlayersModel.findOneAndUpdate({number: data.num}, {photo: Buffer.from(data.photo, "base64")})
    if (doc) {
        ack({ code: wsCodes.SUCCESS })
        io.to('entrance-notifier').emit('entrance.photoTaken', data.num)
    } else {
        ack({ code: wsCodes.NOT_FOUND })
    }
}

type newParams = Parameters<ClientToServerEvents['entrance.new']>
const newPlayer = async (data: newParams['0'], ack: newParams['1']) => {
    const potential = await PlayersModel.findOne({ name: data.name })
    let doc;
    if (!potential){
        data.number = (await PlayersModel.find({}).sort({ number: -1 }).limit(1).then(players => players[0].number))! + 1;
        doc = await PlayersModel.create(data)
    }
    ack({code: wsCodes.SUCCESS, data: {num: (doc! || potential).number!}})
}


export default async function entranceHandler(event: keyof ClientToServerEvents, data: any, socket: ServerSocketAug, io: ServerAug, ack: any){
    try {
        if (event == 'entrance.checkExistence'){
            if (typia.is<checkParameters['0']>(data)){
                checkEntrance(data, ack)
            } else {
                ack({ code: wsCodes.INVALID_MESSAGE })
            }
        } else if (event == 'entrance.validatePresence'){
            if (typia.is<Parameters<ClientToServerEvents['entrance.validatePresence']>['0']>(data)){
                validateEntrance(data, ack, io)
            }
        } else if (event == 'entrance.putPhoto'){
            if (typia.is<Parameters<ClientToServerEvents['entrance.putPhoto']>['0']>(data)){
                putPhoto(data, ack, io)
            } else {
                ack({ code: wsCodes.INVALID_MESSAGE })
            }
        } else if (event == 'entrance.new'){
            if (typia.is<Parameters<ClientToServerEvents['entrance.new']>['0']>(data)){
                newPlayer(data, ack)
            } else {
                ack({ code: wsCodes.INVALID_MESSAGE })
            }
        }
    } catch (e){
        ack({code: wsCodes.SERVER_ERROR})
    }
}