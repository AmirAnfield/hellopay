import nodemailer from 'nodemailer';

// Configuration du transporteur d'email 
// Pour le développement, nous utilisons un compte ethereal (emails capturés localement)
// En production, utilisez un vrai service SMTP (SendGrid, AWS SES, etc.)
const createTransporter = async () => {
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } else {
    // Pour le développement, utilisez un compte test de nodemailer
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
};

/**
 * Envoie un email de vérification à l'utilisateur
 * @param email L'adresse email du destinataire
 * @param token Le token de vérification
 */
export async function sendVerificationEmail(email: string, token: string) {
  try {
    const transporter = await createTransporter();
    
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/auth/verify?token=${token}`;
    
    const mailOptions = {
      from: `"HelloPay" <${process.env.EMAIL_FROM || 'noreply@hellopay.fr'}>`,
      to: email,
      subject: 'Vérifiez votre adresse email - HelloPay',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4f46e5; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">HelloPay</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <h2>Vérification de votre adresse email</h2>
            <p>Merci de vous être inscrit sur HelloPay !</p>
            <p>Pour finaliser votre inscription et accéder à toutes les fonctionnalités, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                Vérifier mon email
              </a>
            </div>
            <p>Si le bouton ne fonctionne pas, vous pouvez également copier et coller ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px;">
              ${verificationUrl}
            </p>
            <p>Ce lien expirera dans 24 heures.</p>
            <p>Si vous n'avez pas demandé cette vérification, vous pouvez ignorer cet email.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
              <p>© ${new Date().getFullYear()} HelloPay. Tous droits réservés.</p>
            </div>
          </div>
        </div>
      `,
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    // En développement, afficher l'URL pour voir l'email
    if (process.env.NODE_ENV !== 'production' && info.messageId) {
      console.log('Email de vérification envoyé: %s', info.messageId);
      console.log('URL de prévisualisation: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erreur d\'envoi d\'email:', error);
    throw new Error('Échec de l\'envoi de l\'email de vérification');
  }
}

/**
 * Envoie un email de réinitialisation de mot de passe
 * @param email L'adresse email du destinataire
 * @param token Le token de réinitialisation
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  try {
    const transporter = await createTransporter();
    
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;
    
    const mailOptions = {
      from: `"HelloPay" <${process.env.EMAIL_FROM || 'noreply@hellopay.fr'}>`,
      to: email,
      subject: 'Réinitialisation de votre mot de passe - HelloPay',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4f46e5; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">HelloPay</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <h2>Réinitialisation de votre mot de passe</h2>
            <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
            <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                Réinitialiser mon mot de passe
              </a>
            </div>
            <p>Si le bouton ne fonctionne pas, vous pouvez également copier et coller ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px;">
              ${resetUrl}
            </p>
            <p>Ce lien expirera dans 1 heure.</p>
            <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
              <p>© ${new Date().getFullYear()} HelloPay. Tous droits réservés.</p>
            </div>
          </div>
        </div>
      `,
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    // En développement, afficher l'URL pour voir l'email
    if (process.env.NODE_ENV !== 'production' && info.messageId) {
      console.log('Email de réinitialisation envoyé: %s', info.messageId);
      console.log('URL de prévisualisation: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erreur d\'envoi d\'email:', error);
    throw new Error('Échec de l\'envoi de l\'email de réinitialisation');
  }
} 