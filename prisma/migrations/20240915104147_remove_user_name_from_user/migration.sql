/*
  Warnings:

  - You are about to drop the column `userName` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_userName_key";

-- DropIndex
DROP INDEX "user_userName_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "userName";
