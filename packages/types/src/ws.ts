import { Device } from "./device";
import { StaffState } from "./staff";
import { Server, Socket as ServerSocket} from "socket.io";
import { Socket } from "socket.io-client";

export const wsCodes = {
    UNAUTHORIZED: 4000,
    INVALID_TOKEN: 4001,
    INVALID_MESSAGE: 4002,
    INVALID_JSON: 4003,
    INVALID_METHOD: 4004,
    INVALID_PARAMS: 4005,
    INVALID_VERSION: 4006,
    INVALID_ID: 4007,
    SERVER_ERROR: 5000,
    SUCCESS: 2000,
    UNEXISTENT_EVENT: 4010,
    NO_ACTION: 4011
}

type NestedServerToClientEvents = {
    connected: () => void;
    message: (method: string) => void;
    error: (code: number, message: string) => void;
    devices: {
        "add.confirm": (code: number, data: Device) => void;
        "remove.confirm": (code: number, data: void) => void;
        "logoff.confirm": (code: number, data: void) => void;
        "modifyPurposes.confirm": (code: number, data: void) => void;
    }
}

type NestedClientToServerEvents = {
    message: (method: number) => void;
    disconnect: () => void;
    devices: {
        add: (socket: ServerSocketAug, device: Device) => void;
        logoff: (socket: ServerSocketAug, deviceId: Device['device']) => void;
        remove: (socket: ServerSocketAug, deviceId: Device['device']) => void;
        modifyPurposes: (socket: ServerSocketAug, deviceId: Device['device'], newPurposes: Device['purposes']) => void;
    };
    games: {
        start: (game: any) => void;
        move: (move: any) => void;
    };
};

// AI generated type for flattening nested objects
type Flatten<T> = {
    [K in keyof T & (string | number)]: T[K] extends (...args: any) => any
    ? { event: K; callback: T[K] }
    : T[K] extends Record<string | number, any>
    ? { [SubKey in keyof T[K] & (string | number)]: { event: `${K}.${SubKey}`; callback: T[K][SubKey] } }[keyof T[K] & (string | number)]
    : never;
}[keyof T & (string | number)];

export type ClientToServerEvents = {
    [K in Flatten<NestedClientToServerEvents>['event']]: Extract<Flatten<NestedClientToServerEvents>, { event: K }>['callback'];
};

export type ServerToClientEvents = {
    [K in Flatten<NestedServerToClientEvents>['event']]: Extract<Flatten<NestedServerToClientEvents>, { event: K }>['callback'];
}

export interface InterServerEvents {
    ping: () => void;
}

export interface SocketData {
    user: StaffState;
    device: Device;
}

export interface ServerAug extends Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> { }
export interface ServerSocketAug extends ServerSocket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> { }
export interface ClientSocketAug extends Socket<ServerToClientEvents, ClientToServerEvents> { }