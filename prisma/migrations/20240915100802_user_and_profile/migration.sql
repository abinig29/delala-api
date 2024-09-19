-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "ACCOUNT_STATUS" AS ENUM ('REGISTERED', 'EMAIL_VERIFIED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "userName" TEXT,
    "role" "RoleType" NOT NULL DEFAULT 'USER',
    "hashed_refresh_token" TEXT,
    "verification_code_hash" TEXT,
    "verification_code_expires" BIGINT,
    "accountStatus" "ACCOUNT_STATUS" NOT NULL DEFAULT 'REGISTERED',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "phone" TEXT,
    "full_name" TEXT,
    "avatar" TEXT,
    "userId" TEXT,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_userName_key" ON "User"("userName");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "user_userName_idx" ON "User"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_phone_key" ON "Profile"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE INDEX "profile_phone_idx" ON "Profile"("phone");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
