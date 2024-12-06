/*
  Warnings:

  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TxnType" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "OrderVariety" AS ENUM ('NORMAL', 'STOPLOSS', 'AMO', 'ROBO');

-- CreateEnum
CREATE TYPE "BrokerOrderType" AS ENUM ('MARKET', 'LIMIT', 'STOPLOSS_LIMIT', 'STOPLOSS_MARKET');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'TRIGGER_PENDING', 'OPEN', 'EXECUTED', 'CANCELED');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('DELIVERY', 'CARRYFORWARD', 'MARGIN', 'INTRADAY', 'BO');

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_brokerAccountId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_signalId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- AlterTable
ALTER TABLE "Signal" ADD COLUMN     "lotSize" INTEGER NOT NULL DEFAULT 1;

-- DropTable
DROP TABLE "Order";

-- DropEnum
DROP TYPE "OrderType";

-- CreateTable
CREATE TABLE "OrderHistory" (
    "id" TEXT NOT NULL,
    "brokerOrderId" TEXT NOT NULL,
    "brokerUniqueOrderId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "price" DECIMAL(65,30),
    "avgPrice" DECIMAL(65,30),
    "qty" INTEGER NOT NULL,
    "lotSize" INTEGER NOT NULL,
    "filledShares" INTEGER NOT NULL,
    "unfilledShares" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "txnType" "TxnType" NOT NULL,
    "variety" "OrderVariety" NOT NULL,
    "orderType" "BrokerOrderType" NOT NULL,
    "productType" "ProductType" NOT NULL,
    "exchange" "Exchange" NOT NULL,
    "symbol" TEXT NOT NULL,
    "symbolToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "signalId" TEXT NOT NULL,
    "brokerAccountId" TEXT NOT NULL,
    "parentOrderId" TEXT,

    CONSTRAINT "OrderHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderHistory_brokerOrderId_key" ON "OrderHistory"("brokerOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderHistory_brokerUniqueOrderId_key" ON "OrderHistory"("brokerUniqueOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderHistory_brokerOrderId_clientId_key" ON "OrderHistory"("brokerOrderId", "clientId");

-- AddForeignKey
ALTER TABLE "OrderHistory" ADD CONSTRAINT "OrderHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderHistory" ADD CONSTRAINT "OrderHistory_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "Signal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderHistory" ADD CONSTRAINT "OrderHistory_brokerAccountId_fkey" FOREIGN KEY ("brokerAccountId") REFERENCES "BrokerAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderHistory" ADD CONSTRAINT "OrderHistory_parentOrderId_fkey" FOREIGN KEY ("parentOrderId") REFERENCES "OrderHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
