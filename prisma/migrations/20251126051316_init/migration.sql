-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "customerEmail" VARCHAR(255) NOT NULL,
    "photoUrl" VARCHAR(500) NOT NULL,
    "originalName" VARCHAR(255),
    "fileSize" INTEGER,
    "mimeType" VARCHAR(50),
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "n8nWebhookSent" BOOLEAN NOT NULL DEFAULT false,
    "n8nRetries" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Photo_status_idx" ON "Photo"("status");

-- CreateIndex
CREATE INDEX "Photo_createdAt_idx" ON "Photo"("createdAt");

-- CreateIndex
CREATE INDEX "Photo_customerEmail_idx" ON "Photo"("customerEmail");
