import * as admin from 'firebase-admin';
import { onCall } from 'firebase-functions/v2/https';
import { calculatePayslip, generatePayslipPdf } from './payslip';

// Initialiser Firebase Admin
admin.initializeApp();

// Fonction simple pour tester le déploiement
export const hello = onCall({
  region: 'europe-west1'
}, (request) => {
  return { message: "Hello from Firebase Functions!" };
});

// Exporter les fonctions
export {
  calculatePayslip,
  generatePayslipPdf
}; 