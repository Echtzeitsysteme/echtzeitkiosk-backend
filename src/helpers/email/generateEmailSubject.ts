import { config } from 'config/config';
import { EmailType } from 'consts/EmailType';
import { User } from 'orm/entities/users/User';

const generateEmailSubjectForGerman = (emailType: EmailType) => {
  switch (emailType) {
    case EmailType.VERIFICATION_EMAIL:
      return `Neues ${config.deployment.projectName}-Konto E-Mail Verifizierung`;

    case EmailType.RESET_PASSWORD:
      return `Passwort zurücksetzen`;

    case EmailType.PASSWORD_CHANGED:
      return `Passwort für Ihr ${config.deployment.projectName}-Konto geändert`;

    case EmailType.USER_REGISTERED_EMAIL_TO_SUPERUSER:
      return `${config.deployment.projectName}: Vor kurzem hat sich ein neuer Benutzer angemeldet!`;

    case EmailType.REGISTRATION_APPROVAL_EMAIL_TO_USER:
      return `Freischaltung erfolgreich, Sie sind nun Kunde von Echtzeitkiosk`;

    case EmailType.REGISTRATION_DECLINATION_EMAIL_TO_USER:
      return `Ihre Registrierung wurde abgelehnt`;

    case EmailType.REGISTRATION_REQUEST_RECEIVED_EMAIL_TO_USER:
      return `Ihre Registrierungsanfrage für ${config.deployment.projectName} wurde erfolgreich empfangen`;

    case EmailType.ACCOUNT_DELETED:
      return `Ihr ${config.deployment.projectName}-Konto wurde gelöscht`;
  }
};

const generateEmailSubjectForEnglish = (emailType: EmailType) => {
  switch (emailType) {
    case EmailType.VERIFICATION_EMAIL:
      return ``;

    case EmailType.RESET_PASSWORD:
      return ``;

    case EmailType.PASSWORD_CHANGED:
      return ``;

    case EmailType.USER_REGISTERED_EMAIL_TO_SUPERUSER:
      return ``;

    case EmailType.REGISTRATION_APPROVAL_EMAIL_TO_USER:
      return ``;

    case EmailType.REGISTRATION_DECLINATION_EMAIL_TO_USER:
      return ``;

    case EmailType.REGISTRATION_REQUEST_RECEIVED_EMAIL_TO_USER:
      return ``;

    case EmailType.ACCOUNT_DELETED:
      return ``;
  }
};

export const generateEmailSubject = (emailType: EmailType, user: User) => {
  switch (user.language) {
    case 'de-DE':
      return generateEmailSubjectForGerman(emailType);
      break;

    default: //
      //'en-US'
      return generateEmailSubjectForEnglish(emailType);
      break;
  }
};
