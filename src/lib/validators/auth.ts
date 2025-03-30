import { z } from 'zod';

/**
 * Schéma pour la route /api/auth/register
 */
export const registerSchema = z.object({
  name: z.string().min(2, { message: "Le nom est requis (minimum 2 caractères)" }),
  email: z.string().email({ message: "Veuillez entrer une adresse email valide" }),
  password: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" }),
  termsAccepted: z.boolean().refine(val => val === true, { 
    message: "Vous devez accepter les conditions d'utilisation" 
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Schéma pour la route /api/auth/login
 */
export const loginSchema = z.object({
  email: z.string().email({ message: "Veuillez entrer une adresse email valide" }),
  password: z.string().min(1, { message: "Veuillez entrer un mot de passe" }),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Schéma pour la route /api/auth/forgot-password
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Veuillez entrer une adresse email valide" }),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * Schéma pour la route /api/auth/reset-password
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, { message: "Le token est requis" }),
  password: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" }),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * Schéma pour la route /api/auth/check-reset-token
 */
export const checkResetTokenSchema = z.object({
  token: z.string().min(1, { message: "Le token est requis" }),
});

export type CheckResetTokenInput = z.infer<typeof checkResetTokenSchema>;

/**
 * Schéma pour la route /api/auth/verify
 */
export const verifyEmailSchema = z.object({
  token: z.string().min(1, { message: "Le token est requis" }),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

/**
 * Schéma pour la route /api/auth/send-verification
 */
export const sendVerificationSchema = z.object({
  email: z.string().email({ message: "Veuillez entrer une adresse email valide" }),
});

export type SendVerificationInput = z.infer<typeof sendVerificationSchema>; 