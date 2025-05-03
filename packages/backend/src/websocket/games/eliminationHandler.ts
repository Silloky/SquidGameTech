import { ClientToServerEvents, ServerSocketAug, ServerAug, wsCodes } from "types";

import rlglEventHandler from "../../controllers/rlgl";
import typia from "typia";
import PlayersModel from "../../models/playerModel";

type eliminationParameters = Parameters<ClientToServerEvents['players.eliminate']>;
export default async function eliminationHandler(event: keyof ClientToServerEvents, data: any, socket: ServerSocketAug, io: ServerAug, ack: eliminationParameters['1']) {
    if (typia.is<Parameters<ClientToServerEvents['players.eliminate']>['0']>(data)) {
        try {
            const potentialFind = await PlayersModel.findOne({ id: data })
            if (potentialFind == null) {
                ack({ code: wsCodes.INVALID_MESSAGE });
                return;
            } else if (!potentialFind.alive){
                ack({ code: wsCodes.NO_ACTION });
                return
            }
            socket.broadcast.to('eliminationsNotifier').emit("players.eliminated", { playerId: data });
            rlglEventHandler('players.eliminate', data, io, ack);
        } catch {
            ack({ code: wsCodes.SERVER_ERROR })
        }
    } else {
        ack({ code: wsCodes.INVALID_MESSAGE });
    }
}