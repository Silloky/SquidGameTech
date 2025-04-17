import { Permissions, ClientToServerEvents, wsCodes } from 'types';
import jwt from 'jsonwebtoken';
import StaffModel from '../models/staffModel';
import { StaffState } from 'types';
import { calculateOverallPermissions } from '../auth';
import { ServerAug, ServerSocketAug } from 'types';

type HandlerFunction = (socket: ServerSocketAug, eventName: string, data: any) => void;

const handlers: { [K in keyof ClientToServerEvents | `${string}.*`]?: HandlerFunction } = {
    'devices.*': require('./deviceHandler').default,
    'games.*': require('./games/gamesHandler').default,
}

export default async function handleWS(socket: ServerSocketAug, io: ServerAug) {

    const token = socket.handshake.auth.token || socket.handshake.headers.token;

    if (!token) {
        socket.disconnect(true);
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET!, async (err: jwt.VerifyErrors | null, decoded: any) => {
        if (err || !decoded) {
            socket.disconnect(true)
            return;
        }

        const staff = await StaffModel.findOneAndUpdate(
            { username: decoded.username },
            { $set: { online: true } },
            { new: true }
        )
        if (!staff) {
            socket.disconnect(true);
            return;
        }

        const staffState: StaffState = {
            isLoggedIn: true,
            token: token,
            username: staff.username,
            permissions: new Permissions(await calculateOverallPermissions(staff.roles, staff.grantedPermissions, staff.deniedPermissions)),
        };

        socket.data.user = staffState;
        socket.send("connected");

        socket.on('disconnect', async () => {
            await StaffModel.findOneAndUpdate(
                { username: socket.data.user.username },
                { $set: { online: false } }
            )
        })

        socket.onAny(((eventName: keyof ClientToServerEvents, data) => {
            for (const eventPattern in handlers) {
                if (eventName.match(new RegExp(eventPattern.replace(/\*/g, ''))) || eventName in Object.keys(handlers)) {
                    const handler = handlers[eventPattern as keyof typeof handlers];
                    if (handler) {
                        handler(socket, eventName, data);
                    }
                    return;
                } else {
                    socket.emit('error', wsCodes.UNEXISTENT_EVENT, 'Unexistent event ' + eventName)
                }
            }
        }))

    });

}