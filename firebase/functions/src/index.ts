import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { calculatePayslip, generatePayslipPdf } from './payslip';

// Initialiser Firebase Admin
admin.initializeApp();

// Exporter les fonctions
export {
  calculatePayslip,
  generatePayslipPdf
}; 