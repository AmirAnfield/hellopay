/*
  Warnings:

  - You are about to drop the column `employeeFirstName` on the `Payslip` table. All the data in the column will be lost.
  - You are about to drop the column `employeeLastName` on the `Payslip` table. All the data in the column will be lost.
  - You are about to drop the column `fileName` on the `Payslip` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `Payslip` table. All the data in the column will be lost.
  - You are about to drop the column `netToPay` on the `Payslip` table. All the data in the column will be lost.
  - You are about to drop the column `period` on the `Payslip` table. All the data in the column will be lost.
  - You are about to alter the column `paymentDate` on the `Payslip` table. The data in that column could be lost. The data in that column will be cast from `String` to `DateTime`.
  - Added the required column `contributionsDetails` to the `Payslip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cumulativeGrossSalary` to the `Payslip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cumulativeNetSalary` to the `Payslip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cumulativePeriodEnd` to the `Payslip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cumulativePeriodStart` to the `Payslip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeeAddress` to the `Payslip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeeContributions` to the `Payslip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeeName` to the `Payslip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeeSocialSecurityNumber` to the `Payslip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employerAddress` to the `Payslip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employerContributions` to the `Payslip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employerCost` to the `Payslip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employerUrssaf` to the `Payslip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fiscalYear` to the `Payslip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hourlyRate` to the `Payslip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hoursWorked` to the `Payslip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `netSalary` to the `Payslip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paidLeaveAcquired` to the `Payslip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paidLeaveRemaining` to the `Payslip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paidLeaveTaken` to the `Payslip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periodEnd` to the `Payslip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periodStart` to the `Payslip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Payslip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "siret" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'France',
    "activityCode" TEXT,
    "urssafNumber" TEXT,
    "legalForm" TEXT,
    "vatNumber" TEXT,
    "phoneNumber" TEXT,
    "email" TEXT,
    "website" TEXT,
    "iban" TEXT,
    "bic" TEXT,
    "legalRepresentative" TEXT,
    "legalRepresentativeRole" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Company_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'France',
    "email" TEXT,
    "phoneNumber" TEXT,
    "birthDate" DATETIME,
    "birthPlace" TEXT,
    "nationality" TEXT,
    "socialSecurityNumber" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "department" TEXT,
    "contractType" TEXT NOT NULL,
    "isExecutive" BOOLEAN NOT NULL DEFAULT false,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "trialPeriodEndDate" DATETIME,
    "hourlyRate" REAL NOT NULL,
    "monthlyHours" REAL NOT NULL DEFAULT 151.67,
    "baseSalary" REAL NOT NULL,
    "bonusAmount" REAL,
    "bonusDescription" TEXT,
    "iban" TEXT,
    "bic" TEXT,
    "companyId" TEXT NOT NULL,
    "paidLeaveBalance" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "Employee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT,
    "employerName" TEXT NOT NULL,
    "employerAddress" TEXT NOT NULL,
    "employerSiret" TEXT NOT NULL,
    "employerUrssaf" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "employeeAddress" TEXT NOT NULL,
    "employeePosition" TEXT NOT NULL,
    "employeeSocialSecurityNumber" TEXT NOT NULL,
    "contractType" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "trialPeriod" INTEGER,
    "salary" REAL NOT NULL,
    "workingHours" REAL,
    "jobDescription" TEXT NOT NULL,
    "collectiveAgreement" TEXT,
    "pdfUrl" TEXT,
    CONSTRAINT "Contract_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Contract_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT,
    "employerName" TEXT NOT NULL,
    "employerAddress" TEXT NOT NULL,
    "employerSiret" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "employeePosition" TEXT NOT NULL,
    "certificateType" TEXT NOT NULL,
    "issueDate" DATETIME NOT NULL,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "content" TEXT NOT NULL,
    "pdfUrl" TEXT,
    CONSTRAINT "Certificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Certificate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Payslip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT,
    "employeeId" TEXT,
    "employerName" TEXT NOT NULL,
    "employerAddress" TEXT NOT NULL,
    "employerSiret" TEXT NOT NULL,
    "employerUrssaf" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "employeeAddress" TEXT NOT NULL,
    "employeePosition" TEXT NOT NULL,
    "employeeSocialSecurityNumber" TEXT NOT NULL,
    "isExecutive" BOOLEAN NOT NULL DEFAULT false,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "paymentDate" DATETIME NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "hourlyRate" REAL NOT NULL,
    "hoursWorked" REAL NOT NULL,
    "grossSalary" REAL NOT NULL,
    "netSalary" REAL NOT NULL,
    "employerCost" REAL NOT NULL,
    "employeeContributions" REAL NOT NULL,
    "employerContributions" REAL NOT NULL,
    "contributionsDetails" TEXT NOT NULL,
    "paidLeaveAcquired" REAL NOT NULL,
    "paidLeaveTaken" REAL NOT NULL,
    "paidLeaveRemaining" REAL NOT NULL,
    "cumulativeGrossSalary" REAL NOT NULL,
    "cumulativeNetSalary" REAL NOT NULL,
    "cumulativePeriodStart" DATETIME NOT NULL,
    "cumulativePeriodEnd" DATETIME NOT NULL,
    "pdfUrl" TEXT,
    CONSTRAINT "Payslip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Payslip_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Payslip_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Payslip" ("createdAt", "employeePosition", "employerName", "employerSiret", "grossSalary", "id", "paymentDate", "userId") SELECT "createdAt", "employeePosition", "employerName", "employerSiret", "grossSalary", "id", "paymentDate", "userId" FROM "Payslip";
DROP TABLE "Payslip";
ALTER TABLE "new_Payslip" RENAME TO "Payslip";
CREATE INDEX "Payslip_employeeName_idx" ON "Payslip"("employeeName");
CREATE INDEX "Payslip_periodStart_idx" ON "Payslip"("periodStart");
CREATE INDEX "Payslip_periodEnd_idx" ON "Payslip"("periodEnd");
CREATE INDEX "Payslip_userId_idx" ON "Payslip"("userId");
CREATE INDEX "Payslip_companyId_idx" ON "Payslip"("companyId");
CREATE INDEX "Payslip_employeeId_idx" ON "Payslip"("employeeId");
CREATE INDEX "Payslip_fiscalYear_idx" ON "Payslip"("fiscalYear");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "hashedPassword" TEXT,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "resetToken" TEXT,
    "resetExpires" DATETIME
);
INSERT INTO "new_User" ("createdAt", "email", "emailVerified", "hashedPassword", "id", "image", "name", "role", "updatedAt") SELECT "createdAt", "email", "emailVerified", "hashedPassword", "id", "image", "name", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Company_userId_idx" ON "Company"("userId");

-- CreateIndex
CREATE INDEX "Company_siret_idx" ON "Company"("siret");

-- CreateIndex
CREATE INDEX "Company_name_idx" ON "Company"("name");

-- CreateIndex
CREATE INDEX "Employee_companyId_idx" ON "Employee"("companyId");

-- CreateIndex
CREATE INDEX "Employee_socialSecurityNumber_idx" ON "Employee"("socialSecurityNumber");

-- CreateIndex
CREATE INDEX "Employee_lastName_idx" ON "Employee"("lastName");

-- CreateIndex
CREATE INDEX "Contract_userId_idx" ON "Contract"("userId");

-- CreateIndex
CREATE INDEX "Contract_companyId_idx" ON "Contract"("companyId");

-- CreateIndex
CREATE INDEX "Contract_employeeName_idx" ON "Contract"("employeeName");

-- CreateIndex
CREATE INDEX "Contract_contractType_idx" ON "Contract"("contractType");

-- CreateIndex
CREATE INDEX "Certificate_userId_idx" ON "Certificate"("userId");

-- CreateIndex
CREATE INDEX "Certificate_companyId_idx" ON "Certificate"("companyId");

-- CreateIndex
CREATE INDEX "Certificate_employeeName_idx" ON "Certificate"("employeeName");

-- CreateIndex
CREATE INDEX "Certificate_certificateType_idx" ON "Certificate"("certificateType");
