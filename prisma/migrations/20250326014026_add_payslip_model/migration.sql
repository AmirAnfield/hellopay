-- CreateTable
CREATE TABLE "Payslip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "employerName" TEXT NOT NULL,
    "employerSiret" TEXT NOT NULL,
    "employeeFirstName" TEXT NOT NULL,
    "employeeLastName" TEXT NOT NULL,
    "employeePosition" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "grossSalary" REAL NOT NULL,
    "netToPay" REAL NOT NULL,
    "paymentDate" TEXT NOT NULL,
    CONSTRAINT "Payslip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
