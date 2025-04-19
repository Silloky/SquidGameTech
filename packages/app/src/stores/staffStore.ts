import { create } from 'zustand';
import { StaffStateApp, AuthReq, AuthRes, Permissions } from 'types';
import { post, RestResError } from '../utils/rest';
import { initializeSocket, getSocket } from '@/utils/socket';
import useDeviceStore from './deviceStore';

const useStaffStore = create<StaffStateApp>()((set) => ({
    isLoggedIn: false,
    token: null,
    username: null,
    permissions: {} as Permissions, // Initialize with an empty Permissions object
    login: async (username, password) => {
        const authData: AuthReq = {
            username: username,
            password: password,
        };

        let authRes: AuthRes;
        try {
            const response = await post('/auth', authData, {});
            authRes = response.data as AuthRes;
            set({
                isLoggedIn: true
            })
        } catch (error: any) {
            throw error as RestResError;
        }

        const socket = initializeSocket(authRes.token, process.env.EXPO_PUBLIC_BASE_URL!);

        socket.on('connect', () => {
            set({
                token: authRes.token,
                username: username,
                permissions: new Permissions(authRes.permissions),
                socket: socket
            });
            useDeviceStore.getState().login();
        })

        socket.connect()
    },
    logout: async () => {
        getSocket()?.disconnect()
        set({
            isLoggedIn: false, 
            token: null, 
            username: null, 
            permissions: {} as Permissions, 
            socket: null 
        })
    },
    socket: null,
}));

export default useStaffStore;
