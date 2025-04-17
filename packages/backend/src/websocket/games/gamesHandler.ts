import { ServerSocketAug } from "types";

export default function gamesHandler(socket: ServerSocketAug, event: string, data: any) {
    console.log(`Received ${event}:`, data);
    socket.send("received")
    // Handle games-related events here
}
