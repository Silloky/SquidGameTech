import { Permissions } from "./permission";

export type StaffRole = {
    _id?: string;
    id: string;
    name: string;
    permissions: string[];
}

export type RawStaffMember = {
    _id?: string;
    id: string;
    roles: string[];
    grantedPermissions: string[];
    deniedPermissions: string[];
    online: boolean;
}

export type StaffMember = {
    id: string;
    name: string;
    permissions: Permissions;
}