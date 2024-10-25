-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "mainLogo" TEXT,
ADD COLUMN     "stateLocation" TEXT;

-- CreateTable
CREATE TABLE "SiteUrl" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "url" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SiteUrl_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SiteUrl_clientId_key" ON "SiteUrl"("clientId");

-- AddForeignKey
ALTER TABLE "SiteUrl" ADD CONSTRAINT "SiteUrl_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
