import Joi from 'joi';
import nodemailer from 'nodemailer';

import { config } from 'config/config';
import { EmailType } from 'consts/EmailType';
import { generateEmailText, generateEmailSubject } from 'helpers/email';
import { getSuperuser } from 'helpers/users/superuserHelpers';
import { CustomerInvoice } from 'orm/entities/customerInvoices/CustomerInvoice';
import { User } from 'orm/entities/users/User';

export const sendEmail = async (to: string, subject: string, text: string) => {
  Joi.assert(config.email.from.address, Joi.string().email()); // informative error message
  Joi.assert(to, Joi.string().email()); // informative error message

  let transport = nodemailer.createTransport(config.email.smtp);
  if (config.env === 'development') console.info('Trying to connect to email server');
  await transport
    .verify()
    .then(() => {
      if (config.env === 'development') console.info('Connected to email server');
    })
    .catch((err) => {
      console.error(err);
    });

  // const msg = { from: `${config.email.from.name} < ${config.email.from.email}>`, to, subject, text };
  const msg = { from: config.email.from, to, subject, text };
  await transport.sendMail(msg);
  transport.close();
  transport = null;
  if (config.env === 'development') console.info('Email sent, closing connection');
};

export const sendVerificationEmail = async (user: User) => {
  const text = await generateEmailText(EmailType.VERIFICATION_EMAIL, user);
  const subject = generateEmailSubject(EmailType.VERIFICATION_EMAIL, user);
  await sendEmail(user.email, subject, text);
};

export const sendRegistrationApprovalEmailToUser = async (user: User) => {
  const text = await generateEmailText(EmailType.REGISTRATION_APPROVAL_EMAIL_TO_USER, user);
  const subject = generateEmailSubject(EmailType.REGISTRATION_APPROVAL_EMAIL_TO_USER, user);
  await sendEmail(user.email, subject, text);
};

export const sendRegistrationDeclinationEmailToUser = async (user: User) => {
  const text = await generateEmailText(EmailType.REGISTRATION_DECLINATION_EMAIL_TO_USER, user);
  const subject = generateEmailSubject(EmailType.REGISTRATION_DECLINATION_EMAIL_TO_USER, user);
  await sendEmail(user.email, subject, text);
};

export const sendAccountDeletedEmail = async (user: User) => {
  const text = await generateEmailText(EmailType.ACCOUNT_DELETED, user);
  const subject = generateEmailSubject(EmailType.ACCOUNT_DELETED, user);
  await sendEmail(user.email, subject, text);
};

export const sendUserRegisteredEmailToSuperuser = async (user: User) => {
  const text = await generateEmailText(EmailType.USER_REGISTERED_EMAIL_TO_SUPERUSER, user);
  const subject = generateEmailSubject(EmailType.USER_REGISTERED_EMAIL_TO_SUPERUSER, user);
  await sendEmail((await getSuperuser()).email, subject, text);
};

export const sendRegistrationRequestReceivedEmailToUser = async (user: User) => {
  const text = await generateEmailText(EmailType.REGISTRATION_REQUEST_RECEIVED_EMAIL_TO_USER, user);
  const subject = generateEmailSubject(EmailType.REGISTRATION_REQUEST_RECEIVED_EMAIL_TO_USER, user);
  await sendEmail(user.email, subject, text);
};

export const sendResetPasswordEmail = async (user: User) => {
  const text = await generateEmailText(EmailType.RESET_PASSWORD, user);
  const subject = generateEmailSubject(EmailType.RESET_PASSWORD, user);
  await sendEmail(user.email, subject, text);
};
export const sendPasswordChangedEmail = async (user: User) => {
  const text = await generateEmailText(EmailType.PASSWORD_CHANGED, user);
  const subject = generateEmailSubject(EmailType.PASSWORD_CHANGED, user);
  await sendEmail(user.email, subject, text);
};

export const sendMonthlyInvoiceEmailToCustomer = async (user: User, customerInvoice: CustomerInvoice) => {
  // const text = await generateEmailText(EmailType.MONTHLY_INVOICE, user, customerInvoice); // TODO: implement
  // const subject = generateEmailSubject(EmailType.MONTHLY_INVOICE, user, customerInvoice); // TODO: implement

  const customerInvoiceURL = `${config.deployment.backendURL}/customer-invoices/${customerInvoice.id}/generate-customer-invoice-pdf`;
  const customerInvoiceMonthYear = customerInvoice.customerInvoiceMonthYear;

  const subject = `Echtzeitkiosk Invoice For ${customerInvoiceMonthYear}`;
  const text = `${customerInvoiceURL}`;

  await sendEmail(user.email, subject, text);
};
