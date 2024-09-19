-- CreateEnum
CREATE TYPE "InquirySatus" AS ENUM ('PENDING', 'ANSWERED');

-- AlterTable
ALTER TABLE "Inquiry" ADD COLUMN     "status" "InquirySatus" NOT NULL DEFAULT 'PENDING';
