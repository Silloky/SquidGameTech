import { Device } from "./device";
import { StaffStateCommon } from "./staff";
import { Player } from './player'
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
    NO_ACTION: 4011,
    NOT_FOUND: 4012
}

type NestedServerToClientEvents = {
    connected: () => void;
    message: (method: string) => void;
    error: (code: number, message: string) => void;
    entrance: {
        presenceValidation: (data: { number: number; name: string }) => void;
        photoTaken: (data: number) => void;
    }
}

type NestedClientToServerEvents = {
    message: (method: number, ack: (response: { code: number; }) => void) => void;
    disconnect: () => void;
    devices: {
        add: (
            data: Device, 
            ack: (response: { code: number; data: Device }) => void
        ) => void;
        remove: (
            data: Device['device'], 
            ack: (response: { code: number; }) => void
        ) => void;
        modifyPurposes: (
            data: { deviceId: Device['device'], 
            newPurposes: Device['purposes'] }, 
            ack: (response: { code: number; }) => void
        ) => void;
    };
    games: {
        start: (game: any) => void;
        move: (move: any) => void;
    };
    entrance: {
        checkExistence: (
            data: number, 
            ack: (response: { code: number; name: string}) => void
        ) => void;
        validatePresence: (
            data: number,
            ack: (response: {code: number}) => void
        ) => void;
        putPhoto: (
            data: {num: number, photo: Base64URLString},
            ack: (response: {code: number}) => void
        ) => void;
        new: (
            data: Player,
            ack: (response: {code: number, data: {num: number}}) => void
        ) => void;
    }
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
    user: StaffStateCommon;
    device: Device;
}

export interface ServerAug extends Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> { }
export interface ServerSocketAug extends ServerSocket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> { }
export interface ClientSocketAug extends Socket<ServerToClientEvents, ClientToServerEvents> { }