export enum RoleEnum {
    USER = 'USER',
    ADMIN = 'ADMIN',
    SUPER_ADMIN = 'SUPER_ADMIN',
}

import { Profile, RoleType, User } from "@prisma/client";


export class UserFromToken {
    id?: string;
    role?: RoleType;
    sessionId?: string;
    expiryDate?: number;
}


export interface ExtendedUser extends Partial<User> {
    profile: Profile
}