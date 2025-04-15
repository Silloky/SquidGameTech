import { create } from 'zustand';
import { StaffState, AuthReq, AuthRes, Permissions } from 'types';
import { post, RestResError } from '../utils/rest';



const useStaffStore = create<StaffState>((set) => ({
    isLoggedIn: false,
    token: null,
    username: null,
    permissions: {} as Permissions, // Initialize with an empty Permissions object
    login: async (username, password) => {
        const authData: AuthReq = {
            username: username,
            password: password,
        };

        try {
            const response = await post('/auth', authData, {});
            const authRes = response.data as AuthRes;
            set({ 
                isLoggedIn: true, 
                token: authRes.token, 
                username: username, 
                permissions: new Permissions(authRes.permissions) 
            });
        } catch (error: any) {
            throw error as RestResError;
        }
    },
    logout: () => set({ isLoggedIn: false, token: null, username: null, permissions: {} as Permissions }),
}));

export default useStaffStore;
