-- CreateTable
CREATE TABLE "Inquery" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "note" TEXT,
    "productId" TEXT NOT NULL,

    CONSTRAINT "Inquery_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Inquery" ADD CONSTRAINT "Inquery_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
