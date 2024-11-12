/*
  Warnings:

  - You are about to drop the `Signals` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Signals" DROP CONSTRAINT "Signals_brokerAccountId_fkey";

-- DropForeignKey
ALTER TABLE "Signals" DROP CONSTRAINT "Signals_userId_fkey";

-- DropTable
DROP TABLE "Signals";

-- CreateTable
CREATE TABLE "Signal" (
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

    CONSTRAINT "Signal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Signal_brokerAccountId_key" ON "Signal"("brokerAccountId");

-- AddForeignKey
ALTER TABLE "Signal" ADD CONSTRAINT "Signal_brokerAccountId_fkey" FOREIGN KEY ("brokerAccountId") REFERENCES "BrokerAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signal" ADD CONSTRAINT "Signal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
