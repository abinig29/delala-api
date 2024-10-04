/*
  Warnings:

  - You are about to drop the column `make` on the `VehicleDetails` table. All the data in the column will be lost.
  - Added the required column `makeId` to the `VehicleDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VehicleDetails" DROP COLUMN "make",
ADD COLUMN     "makeId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "CarMake" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "CarMake_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VehicleDetails" ADD CONSTRAINT "VehicleDetails_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "CarMake"("id") ON DELETE CASCADE ON UPDATE CASCADE;
