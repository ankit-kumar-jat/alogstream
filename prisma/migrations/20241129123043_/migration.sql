-- CreateTable
CREATE TABLE "SignalLogs" (
    "id" TEXT NOT NULL,
    "body" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "SignalLogs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SignalLogs" ADD CONSTRAINT "SignalLogs_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "Signal"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignalLogs" ADD CONSTRAINT "SignalLogs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
