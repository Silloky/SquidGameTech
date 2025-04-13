export type Device = {
    id: string;
    os: string;
    osVersion: string;
    device: string;
    deviceType: string;
    purposes: ('s-out' | 's-in' | 'v-in' | 'v-out' | 'gc-in' | 'gc-out')[]; 
    // Sound output | Sound input | Video input | Video output | Game control input | Game control output
    live: boolean;
    user: string;
    userName: string;
}