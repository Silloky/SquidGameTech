import { Permissions } from "./permissions";
import { ClientSocketAug } from "./ws";

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

export interface StaffStateCommon {
    isLoggedIn: boolean;
    token: string | null;
    username: string | null;
    permissions: Permissions;
    name: string | null;
}

export interface StaffStateApp extends StaffStateCommon {
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    socket: ClientSocketAug | null;
}