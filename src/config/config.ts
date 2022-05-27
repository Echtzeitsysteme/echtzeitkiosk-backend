import path from 'path';

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = z.object({
  NODE_ENV: z.union([z.literal('production'), z.literal('staging'), z.literal('development'), z.literal('test')]),
  PORT: z
    .string()
    .default('4000')
    .transform((str) => parseInt(str, 10)),

  POSTGRES_HOST: z.string().default('postgres'),
  POSTGRES_PORT: z
    .string()
    .default('5432')
    .transform((str) => parseInt(str, 10)),
  POSTGRES_USER: z.string().default('postgres'),
  POSTGRES_PASSWORD: z.string().default('postgres'),
  POSTGRES_DB_NAME: z.string().default('postgres'),
  PGTZ: z.string().default('GMT'),

  // JWT secret key
  JWT_SECRET: z.string(),

  // minutes after which access tokens expire
  JWT_ACCESS_EXPIRATION_MINUTES: z
    .string()
    .default('30')
    .transform((str) => parseInt(str, 10)),

  // minutes after which reset password token expires
  JWT_RESET_PASSWORD_EXPIRATION_MINUTES: z
    .string()
    .default('10')
    .transform((str) => parseInt(str, 10)),

  // minutes after which verify email token expires
  JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: z
    .string()
    .default('10')
    .transform((str) => parseInt(str, 10)),

  // server that will send the emails
  SMTP_HOST: z.string(),
  // port to connect to the email server
  SMTP_PORT: z.string().transform((str) => parseInt(str, 10)),
  // username for email server
  SMTP_USERNAME: z.string(),
  // password for email server
  SMTP_PASSWORD: z.string(),
  // the from field in the emails sent by the app
  EMAIL_FROM_ADDRESS: z.string().email(),
  EMAIL_FROM_NAME: z.string(),

  SUPPORT_EMAIL: z.string(),

  PROJECT_NAME: z.string().default('Echtzeitkiosk'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  SUPERUSER_EMAIL: z.string().email(),
  SUPERUSER_PASSWORD: z.string(),
  INVITATION_CODE: z.string().default('fa8ae7c0-03d9-4c26-9405-ad9551d4ceda'),
});

const envVars = envVarsSchema.parse(process.env);

export const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  projectName: envVars.PROJECT_NAME,
  deployment: {
    frontendURL: envVars.FRONTEND_URL,
    projectName: envVars.PROJECT_NAME,
    invitationCode: envVars.INVITATION_CODE,
  },
  postgres: {
    host: envVars.POSTGRES_HOST,
    port: envVars.POSTGRES_PORT,
    user: envVars.POSTGRES_USER,
    password: envVars.POSTGRES_PASSWORD,
    dbName: envVars.POSTGRES_DB_NAME,
    tz: envVars.PGTZ,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: { name: envVars.EMAIL_FROM_NAME, address: envVars.EMAIL_FROM_ADDRESS },
    supportEmail: envVars.SUPPORT_EMAIL,
  },
  superuser: {
    email: envVars.SUPERUSER_EMAIL,
    password: envVars.SUPERUSER_PASSWORD,
  },
};
