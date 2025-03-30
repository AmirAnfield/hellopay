/*
  Warnings:

  - Added the required column `fileKey` to the `Contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileType` to the `Contract` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payslip" ADD COLUMN "modificationLog" TEXT;
ALTER TABLE "Payslip" ADD COLUMN "validatedBy" TEXT;

-- CreateTable
CREATE TABLE "Contribution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "payslipId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "baseType" TEXT NOT NULL,
    "baseAmount" REAL NOT NULL,
    "employeeRate" REAL NOT NULL,
    "employerRate" REAL NOT NULL,
    "employeeAmount" REAL NOT NULL,
    "employerAmount" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Contribution_payslipId_fkey" FOREIGN KEY ("payslipId") REFERENCES "Payslip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Contract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "reference" TEXT,
    "status" TEXT NOT NULL,
    "contractType" TEXT NOT NULL,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "companyId" TEXT NOT NULL,
    "counterpartyName" TEXT,
    "counterpartyEmail" TEXT,
    "tags" TEXT,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Contract_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Contract_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Contract" ("companyId", "contractType", "counterpartyEmail", "counterpartyName", "createdAt", "description", "endDate", "fileName", "fileSize", "fileUrl", "id", "reference", "startDate", "status", "tags", "title", "updatedAt", "userId") SELECT "companyId", "contractType", "counterpartyEmail", "counterpartyName", "createdAt", "description", "endDate", "fileName", "fileSize", "fileUrl", "id", "reference", "startDate", "status", "tags", "title", "updatedAt", "userId" FROM "Contract";
DROP TABLE "Contract";
ALTER TABLE "new_Contract" RENAME TO "Contract";
CREATE INDEX "Contract_userId_idx" ON "Contract"("userId");
CREATE INDEX "Contract_companyId_idx" ON "Contract"("companyId");
CREATE INDEX "Contract_status_idx" ON "Contract"("status");
CREATE INDEX "Contract_contractType_idx" ON "Contract"("contractType");
CREATE INDEX "Contract_createdAt_idx" ON "Contract"("createdAt");
CREATE INDEX "Contract_updatedAt_idx" ON "Contract"("updatedAt");
CREATE INDEX "Contract_startDate_idx" ON "Contract"("startDate");
CREATE INDEX "Contract_endDate_idx" ON "Contract"("endDate");
CREATE INDEX "Contract_title_idx" ON "Contract"("title");
CREATE INDEX "Contract_reference_idx" ON "Contract"("reference");
CREATE INDEX "Contract_counterpartyName_idx" ON "Contract"("counterpartyName");
CREATE INDEX "Contract_tags_idx" ON "Contract"("tags");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Contribution_payslipId_idx" ON "Contribution"("payslipId");

-- CreateIndex
CREATE INDEX "Contribution_category_idx" ON "Contribution"("category");
