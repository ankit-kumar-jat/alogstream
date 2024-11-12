/*
  Warnings:

  - You are about to drop the column `brokerAccountId` on the `Signal` table. All the data in the column will be lost.
  - You are about to drop the column `budget` on the `Signal` table. All the data in the column will be lost.
  - You are about to drop the column `remainingBudget` on the `Signal` table. All the data in the column will be lost.
  - You are about to drop the column `symbol` on the `Signal` table. All the data in the column will be lost.
  - You are about to drop the column `symbolToken` on the `Signal` table. All the data in the column will be lost.
  - You are about to alter the column `takeProfitValue` on the `Signal` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `stopLossValue` on the `Signal` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - The `status` column on the `Signal` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `tickerSymbol` to the `Signal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tickerSymbolToken` to the `Signal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Signal` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `takeProfitType` on the `Signal` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `stopLossType` on the `Signal` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Signal" DROP CONSTRAINT "Signal_brokerAccountId_fkey";

-- DropIndex
DROP INDEX "Signal_brokerAccountId_key";

-- AlterTable
ALTER TABLE "Signal" DROP COLUMN "brokerAccountId",
DROP COLUMN "budget",
DROP COLUMN "remainingBudget",
DROP COLUMN "symbol",
DROP COLUMN "symbolToken",
ADD COLUMN     "tickerSymbol" TEXT NOT NULL,
ADD COLUMN     "tickerSymbolToken" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
DROP COLUMN "takeProfitType",
ADD COLUMN     "takeProfitType" TEXT NOT NULL,
DROP COLUMN "stopLossType",
ADD COLUMN     "stopLossType" TEXT NOT NULL,
ALTER COLUMN "takeProfitValue" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "stopLossValue" SET DATA TYPE DECIMAL(65,30),
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'DRAFT';

-- DropEnum
DROP TYPE "ProfitLossType";

-- DropEnum
DROP TYPE "SignalStatusType";

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "brokerOrderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Strategy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Strategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BrokerAccountToSignal" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BrokerAccountToSignal_AB_unique" ON "_BrokerAccountToSignal"("A", "B");

-- CreateIndex
CREATE INDEX "_BrokerAccountToSignal_B_index" ON "_BrokerAccountToSignal"("B");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Strategy" ADD CONSTRAINT "Strategy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BrokerAccountToSignal" ADD CONSTRAINT "_BrokerAccountToSignal_A_fkey" FOREIGN KEY ("A") REFERENCES "BrokerAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BrokerAccountToSignal" ADD CONSTRAINT "_BrokerAccountToSignal_B_fkey" FOREIGN KEY ("B") REFERENCES "Signal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
