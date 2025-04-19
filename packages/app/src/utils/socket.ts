import { io, Socket } from 'socket.io-client';
import { ClientSocketAug } from 'types';

let socket: ClientSocketAug | null = null;

export const initializeSocket = (token: string | null, baseUrl: string): ClientSocketAug => {
    if (socket) {
        socket.disconnect();
    }

    socket = io(baseUrl, {
        transports: ["websocket"],
        timeout: 60000,
        ackTimeout: 60000,
        auth: { token: token },
    }) as ClientSocketAug;

    socket.on('connect', () => {
        console.log('Socket connected');
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected');
    });

    socket.on('message', (text) => {
        console.log(text);
    });

    socket.on('error', (code, message) => {
        console.log(code, message)
    })

    return socket;
};

export const getSocket = (): ClientSocketAug | null => {
    return socket;
};
