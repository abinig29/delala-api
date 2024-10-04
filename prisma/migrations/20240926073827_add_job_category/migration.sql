/*
  Warnings:

  - Added the required column `jobCategoryId` to the `JobDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "JobDetails" ADD COLUMN     "jobCategoryId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "JobCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "JobCategory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "JobDetails" ADD CONSTRAINT "JobDetails_jobCategoryId_fkey" FOREIGN KEY ("jobCategoryId") REFERENCES "JobCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
