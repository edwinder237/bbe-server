/*
  Warnings:

  - You are about to drop the column `integrationType` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `IntegrationTypes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_integrationType_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "integrationType",
ADD COLUMN     "integrationId" INTEGER;

-- DropTable
DROP TABLE "IntegrationTypes";

-- CreateTable
CREATE TABLE "Integration" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Integration_title_key" ON "Integration"("title");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration"("id") ON DELETE SET NULL ON UPDATE CASCADE;
