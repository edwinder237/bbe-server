-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "integrationType" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationTypes" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "IntegrationTypes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationTypes_title_key" ON "IntegrationTypes"("title");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_integrationType_fkey" FOREIGN KEY ("integrationType") REFERENCES "IntegrationTypes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
