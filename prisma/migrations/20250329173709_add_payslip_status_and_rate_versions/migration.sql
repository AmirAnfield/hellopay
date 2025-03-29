-- CreateTable
CREATE TABLE "RateVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "effectiveFrom" DATETIME NOT NULL,
    "effectiveTo" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "ratesJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
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
    "status" TEXT NOT NULL DEFAULT 'draft',
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "validatedAt" DATETIME,
    "pdfUrl" TEXT,
    CONSTRAINT "Payslip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Payslip_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Payslip_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Payslip" ("companyId", "contributionsDetails", "createdAt", "cumulativeGrossSalary", "cumulativeNetSalary", "cumulativePeriodEnd", "cumulativePeriodStart", "employeeAddress", "employeeContributions", "employeeId", "employeeName", "employeePosition", "employeeSocialSecurityNumber", "employerAddress", "employerContributions", "employerCost", "employerName", "employerSiret", "employerUrssaf", "fiscalYear", "grossSalary", "hourlyRate", "hoursWorked", "id", "isExecutive", "netSalary", "paidLeaveAcquired", "paidLeaveRemaining", "paidLeaveTaken", "paymentDate", "pdfUrl", "periodEnd", "periodStart", "updatedAt", "userId") SELECT "companyId", "contributionsDetails", "createdAt", "cumulativeGrossSalary", "cumulativeNetSalary", "cumulativePeriodEnd", "cumulativePeriodStart", "employeeAddress", "employeeContributions", "employeeId", "employeeName", "employeePosition", "employeeSocialSecurityNumber", "employerAddress", "employerContributions", "employerCost", "employerName", "employerSiret", "employerUrssaf", "fiscalYear", "grossSalary", "hourlyRate", "hoursWorked", "id", "isExecutive", "netSalary", "paidLeaveAcquired", "paidLeaveRemaining", "paidLeaveTaken", "paymentDate", "pdfUrl", "periodEnd", "periodStart", "updatedAt", "userId" FROM "Payslip";
DROP TABLE "Payslip";
ALTER TABLE "new_Payslip" RENAME TO "Payslip";
CREATE INDEX "Payslip_employeeName_idx" ON "Payslip"("employeeName");
CREATE INDEX "Payslip_periodStart_idx" ON "Payslip"("periodStart");
CREATE INDEX "Payslip_periodEnd_idx" ON "Payslip"("periodEnd");
CREATE INDEX "Payslip_userId_idx" ON "Payslip"("userId");
CREATE INDEX "Payslip_companyId_idx" ON "Payslip"("companyId");
CREATE INDEX "Payslip_employeeId_idx" ON "Payslip"("employeeId");
CREATE INDEX "Payslip_fiscalYear_idx" ON "Payslip"("fiscalYear");
CREATE INDEX "Payslip_status_idx" ON "Payslip"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "RateVersion_year_idx" ON "RateVersion"("year");

-- CreateIndex
CREATE INDEX "RateVersion_isActive_idx" ON "RateVersion"("isActive");
