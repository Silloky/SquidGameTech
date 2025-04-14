import { Permissions } from "./permissions";

export type StaffRole = {
    _id?: string;
    id: string;
    name: string;
    permissions: string[];
}

export type InternalStaffMember = {
    username: string;
    pwdH: string;
    name: string;
    roles: string[];
    grantedPermissions: string[];
    deniedPermissions: string[];
    online: boolean;
}

export interface StaffState {
    isLoggedIn: boolean;
    token: string | null;
    username: string | null;
    permissions: Permissions;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}