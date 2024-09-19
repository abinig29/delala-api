import { User } from "@prisma/client";

export class UserRes {
  error?: string;
  user?: User;
}

// Pagination users Response
