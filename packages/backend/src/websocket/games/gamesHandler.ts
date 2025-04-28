import rlglEventHandler from "../../controllers/rlgl"; // Import the handler
import { ServerSocketAug, ClientToServerEvents, ServerAug, wsCodes } from "types";

export default async function gamesHandler(event: keyof ClientToServerEvents, data: any, socket: ServerSocketAug, io: ServerAug, ack: any) {
    try {
        if (event.startsWith('games.rlgl.')) {
            rlglEventHandler(event, data, io, ack);
        }
    } catch (error) {
        console.error("Error in gamesHandler:", error);
        if (typeof ack === 'function') {
            ack({ code: wsCodes.SERVER_ERROR, message: "Internal server error." });
        }
    }
}
