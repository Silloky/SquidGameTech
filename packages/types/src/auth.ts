export type AuthReq = {
    username: string;
    password: string;
}

export type AuthRes = {
    token: string;
    username: string;
    name: string;
    permissions: string[];
}