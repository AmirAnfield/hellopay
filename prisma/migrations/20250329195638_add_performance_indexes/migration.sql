/*
  Warnings:

  - You are about to drop the column `collectiveAgreement` on the `Contract` table. All the data in the column will be lost.
  - You are about to drop the column `employeeAddress` on the `Contract` table. All the data in the column will be lost.
  - You are about to drop the column `employeeName` on the `Contract` table. All the data in the column will be lost.
  - You are about to drop the column `employeePosition` on the `Contract` table. All the data in the column will be lost.
  - You are about to drop the column `employeeSocialSecurityNumber` on the `Contract` table. All the data in the column will be lost.
  - You are about to drop the column `employerAddress` on the `Contract` table. All the data in the column will be lost.
  - You are about to drop the column `employerName` on the `Contract` table. All the data in the column will be lost.
  - You are about to drop the column `employerSiret` on the `Contract` table. All the data in the column will be lost.
  - You are about to drop the column `employerUrssaf` on the `Contract` table. All the data in the column will be lost.
  - You are about to drop the column `jobDescription` on the `Contract` table. All the data in the column will be lost.
  - You are about to drop the column `pdfUrl` on the `Contract` table. All the data in the column will be lost.
  - You are about to drop the column `salary` on the `Contract` table. All the data in the column will be lost.
  - You are about to drop the column `trialPeriod` on the `Contract` table. All the data in the column will be lost.
  - You are about to drop the column `workingHours` on the `Contract` table. All the data in the column will be lost.
  - Added the required column `fileName` to the `Contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileSize` to the `Contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileUrl` to the `Contract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Contract` table without a default value. This is not possible if the table is not empty.
  - Made the column `companyId` on table `Contract` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Contract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "contractType" TEXT NOT NULL,
    "tags" TEXT,
    "reference" TEXT,
    "counterpartyName" TEXT,
    "counterpartyEmail" TEXT,
    CONSTRAINT "Contract_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Contract_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Contract" ("companyId", "contractType", "createdAt", "endDate", "id", "startDate", "updatedAt", "userId") SELECT "companyId", "contractType", "createdAt", "endDate", "id", "startDate", "updatedAt", "userId" FROM "Contract";
DROP TABLE "Contract";
ALTER TABLE "new_Contract" RENAME TO "Contract";
CREATE INDEX "Contract_userId_idx" ON "Contract"("userId");
CREATE INDEX "Contract_companyId_idx" ON "Contract"("companyId");
CREATE INDEX "Contract_status_idx" ON "Contract"("status");
CREATE INDEX "Contract_contractType_idx" ON "Contract"("contractType");
CREATE INDEX "Contract_startDate_idx" ON "Contract"("startDate");
CREATE INDEX "Contract_endDate_idx" ON "Contract"("endDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Employee_firstName_idx" ON "Employee"("firstName");

-- CreateIndex
CREATE INDEX "Employee_startDate_idx" ON "Employee"("startDate");

-- CreateIndex
CREATE INDEX "Employee_endDate_idx" ON "Employee"("endDate");

-- CreateIndex
CREATE INDEX "Employee_contractType_idx" ON "Employee"("contractType");

-- CreateIndex
CREATE INDEX "Payslip_paymentDate_idx" ON "Payslip"("paymentDate");

-- CreateIndex
CREATE INDEX "Payslip_grossSalary_idx" ON "Payslip"("grossSalary");

-- CreateIndex
CREATE INDEX "Payslip_periodStart_periodEnd_idx" ON "Payslip"("periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
