-- CreateTable
CREATE TABLE "public"."bots" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."call_logs" (
    "id" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "transcript" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "call_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bots_uid_key" ON "public"."bots"("uid");

-- AddForeignKey
ALTER TABLE "public"."call_logs" ADD CONSTRAINT "call_logs_botId_fkey" FOREIGN KEY ("botId") REFERENCES "public"."bots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
