/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { generateClause } from "./contract";
import { exportContractPdf, lockContract } from "./contract-pdf";
import { verifyContractConsistency } from "./contract-verify";

// Initialiser Firebase Admin SDK
admin.initializeApp();

logger.info("Genkit AI functions initialized");

// Exporter nos fonctions Cloud
export { 
  generateClause,
  exportContractPdf,
  lockContract,
  verifyContractConsistency
};

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
