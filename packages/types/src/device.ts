export type Device = {
    id?: string;
    os: string | null;
    osVersion: string | null;
    device: string | null;
    deviceType: string;
    purposes: ('s-out' | 's-in' | 'v-in' | 'v-out' | 'gc-in' | 'gc-out')[]; 
    // Sound output | Sound input | Video input | Video output | Game control input | Game control output
    live?: boolean;
}

export interface DeviceState extends Device {
    login: () => Promise<void>;
    modifyPurposes: (newPurposes: Device['purposes']) => Promise<void>;
    removeDevice: () => Promise<void>;
}