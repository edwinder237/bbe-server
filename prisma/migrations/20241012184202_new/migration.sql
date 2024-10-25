/*
  Warnings:

  - A unique constraint covering the columns `[cuid]` on the table `Client` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "cuid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Client_cuid_key" ON "Client"("cuid");
