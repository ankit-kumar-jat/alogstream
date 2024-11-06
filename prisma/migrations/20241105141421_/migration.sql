/*
  Warnings:

  - You are about to drop the column `brokerName` on the `BrokerAccount` table. All the data in the column will be lost.
  - You are about to drop the column `brokerUserId` on the `BrokerAccount` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[clientId]` on the table `BrokerAccount` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `broker` to the `BrokerAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientId` to the `BrokerAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientName` to the `BrokerAccount` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Exchnage" AS ENUM ('BSE', 'NSE');

-- CreateEnum
CREATE TYPE "ProfitLossType" AS ENUM ('ABSOLUTE', 'PERCENTAGE');

-- DropIndex
DROP INDEX "BrokerAccount_brokerName_brokerUserId_key";

-- AlterTable
ALTER TABLE "BrokerAccount" DROP COLUMN "brokerName",
DROP COLUMN "brokerUserId",
ADD COLUMN     "broker" TEXT NOT NULL,
ADD COLUMN     "clientId" TEXT NOT NULL,
ADD COLUMN     "clientName" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Signals" (
    "id" TEXT NOT NULL,
    "budget" DECIMAL(65,30) NOT NULL,
    "remainingBudget" DECIMAL(65,30) NOT NULL,
    "exchange" "Exchnage" NOT NULL,
    "symbol" TEXT NOT NULL,
    "symbolToken" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "takeProfitType" "ProfitLossType" NOT NULL,
    "stopLossType" "ProfitLossType" NOT NULL,
    "takeProfitValue" DECIMAL(65,30) NOT NULL,
    "stopLossValue" DECIMAL(65,30) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "brokerAccountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Signals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Signals_brokerAccountId_key" ON "Signals"("brokerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "BrokerAccount_clientId_key" ON "BrokerAccount"("clientId");

-- AddForeignKey
ALTER TABLE "Signals" ADD CONSTRAINT "Signals_brokerAccountId_fkey" FOREIGN KEY ("brokerAccountId") REFERENCES "BrokerAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signals" ADD CONSTRAINT "Signals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
