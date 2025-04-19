import { Permissions, ClientToServerEvents, wsCodes } from 'types';
import jwt from 'jsonwebtoken';
import StaffModel from '../models/staffModel';
import { StaffStateCommon } from 'types';
import { calculateOverallPermissions } from '../auth';
import { ServerAug, ServerSocketAug } from 'types';
import DevicesModel from '../models/deviceModel';

type HandlerFunction = (eventName: string, data: any, socket: ServerSocketAug, ack?: Function) => void;

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

        const staffState: StaffStateCommon = {
            isLoggedIn: true,
            token: token,
            username: staff.username,
            permissions: new Permissions(await calculateOverallPermissions(staff.roles, staff.grantedPermissions, staff.deniedPermissions)),
        };
        socket.data.user = staffState;
        socket.emit("connected");

        socket.on('disconnect', async () => {
            if (socket.data.device) {
                await DevicesModel.findOneAndUpdate(
                    { id: socket.data.device.id },
                    { live: false }
                )
            }
            if ((await DevicesModel.countDocuments({$and: [{username: socket.data.user.username}, {live: true}]})) == 0){
                StaffModel.findOneAndUpdate(
                    { username: socket.data.user.username },
                    { $set: { online: false } }
                )
            }
        })

        socket.onAny(((eventName: keyof ClientToServerEvents, data, ack) => {
            console.log(eventName)
            let handled = false;
            for (const eventPattern in handlers) {
                const regex = new RegExp(`^${eventPattern.replace(/\*/g, '.*')}$`);
                if (eventName.match(regex)) {
                    const handler = handlers[eventPattern as keyof typeof handlers];
                    if (handler) {
                        handler(eventName, data, socket, ack);
                        handled = true;
                        break;
                    }
                }
            }
            if (!handled) {
                socket.emit('error', wsCodes.UNEXISTENT_EVENT, 'Unexistent event ' + eventName);
            }
        }))

    });

}