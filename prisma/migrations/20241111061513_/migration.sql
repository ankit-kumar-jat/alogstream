/*
  Warnings:

  - You are about to drop the column `quantity` on the `Signal` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Signal` table. All the data in the column will be lost.
  - Added the required column `brokrage` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pendingQty` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profitLoss` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qty` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `signalId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Signal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "brokrage" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "pendingQty" INTEGER NOT NULL,
ADD COLUMN     "price" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "profitLoss" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "qty" INTEGER NOT NULL,
ADD COLUMN     "signalId" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Signal" DROP COLUMN "quantity",
DROP COLUMN "title",
ADD COLUMN     "name" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "Signal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
