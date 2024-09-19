/*
  Warnings:

  - You are about to drop the `Serivce` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ServiceDetails" DROP CONSTRAINT "ServiceDetails_serviceId_fkey";

-- DropTable
DROP TABLE "Serivce";

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ServiceDetails" ADD CONSTRAINT "ServiceDetails_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
