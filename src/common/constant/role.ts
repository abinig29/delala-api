export enum RoleType {
    USER = 'USER',
    ADMIN = 'ADMIN',
    SUPER_ADMIN = 'SUPER_ADMIN',
}


export class UserFromToken {
    id?: string;
    role?: RoleType;
    sessionId?: string;
    expiryDate?: number;
}