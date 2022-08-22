import { config } from 'config/config';
import { EmailType } from 'consts/EmailType';
import { User } from 'orm/entities/users/User';

const generateEmailTextForGerman = async (emailType: EmailType, user: User) => {
  switch (emailType) {
    case EmailType.VERIFICATION_EMAIL:
      const verifyEmailToken = await User.getVerifyEmailToken(user);

      const verificationEmailUrl = `${config.deployment.frontendURL}/#/verify-email?token=${verifyEmailToken}`;

      return `Hallo Frau/Herr ${user.lastName},

      Sie möchten ein neues Konto auf dem ${config.deployment.projectName}-Portal erstellen? 
      Zum Schutz Ihrer Daten müssen wir sicherstellen, dass diese E-Mail-Adresse Ihnen gehört. Bitte bestätigen Sie dafür den folgenden Link:
      ${verificationEmailUrl}
    
      Sie können den Link nicht bestätigen? Dann kopieren Sie ihn einfach in die Adresszeile Ihres Browsers. Achten Sie darauf, dass Sie Zeilenumbrüche oder Leerzeichen nicht mitkopieren.

      Wichtiger Hinweis: Wir werden Sie nie dazu auffordern, persönliche Daten per E-Mail zu versenden oder über einen Link zu aktualisieren.
      Bitte reagieren Sie nicht auf solche E-Mails,
      es könnte sich um einen Phishing-Versuch handeln.
      
      Sollten Sie diese E-Mail grundlos erhalten haben, brauchen Sie nicht zu reagieren. 
      
      Link zum Portal: ${config.deployment.frontendURL}
      Bei Fragen wenden Sie sich bitte an: ${config.email.supportEmail}
    
      Freundliche Grüße
      Ihr ${config.deployment.projectName}-Team

      Diese E-Mail wurde automatisch erstellt, bitte antworten Sie nicht darauf.
          `;

      break;

    case EmailType.RESET_PASSWORD:
      const resetPasswordToken = await User.getResetPasswordToken(user.email);

      const resetPasswordUrl = `${config.deployment.frontendURL}/#/reset-password?token=${resetPasswordToken}`;

      return `Hallo Frau/Herr ${user.lastName},

      Sie möchten Ihr Passwort zurücksetzen?
      Bitte bestätigen Sie dafür den folgenden Freischaltlink und vergeben sich danach ein neues Passwort:
      ${resetPasswordUrl}
    
      Sie können den Link nicht bestätigen? Dann kopieren Sie ihn einfach in die Adresszeile Ihres Browsers. Achten Sie darauf, dass Sie Zeilenumbrüche oder Leerzeichen nicht mitkopieren.

      Wichtiger Hinweis: Wir werden Sie nie dazu auffordern, persönliche Daten per E-Mail zu versenden oder über einen Link zu aktualisieren.
      Bitte reagieren Sie nicht auf solche E-Mails,
      es könnte sich um einen Phishing-Versuch handeln.
      
      Sollten Sie diese E-Mail grundlos erhalten haben, brauchen Sie nicht zu reagieren. 
      
      Link zum Portal: ${config.deployment.frontendURL}
      Bei Fragen wenden Sie sich bitte an: ${config.email.supportEmail}
    
      Freundliche Grüße
      Ihr ${config.deployment.projectName}-Team

      Diese E-Mail wurde automatisch erstellt, bitte antworten Sie nicht darauf.
          `;

    case EmailType.PASSWORD_CHANGED:
      return `Hallo Frau/Herr ${user.lastName},

        Sie haben vor kurzem erfolgreich Ihr ${config.deployment.projectName}-Kontopasswort geändert.
        Wenn Sie diese Anfrage nicht gestellt haben,
        setzen Sie bitte das Passwort Ihres ${config.deployment.projectName}-Kontos zurück. Falls Sie das Passwort nicht zurücksetzen können,
        kontaktieren Sie uns bitte per E-Mail: ${config.email.supportEmail}
        
        Wichtiger Hinweis: Wir werden Sie nie dazu auffordern, persönliche Daten per E-Mail zu versenden oder über einen Link zu aktualisieren.
        Bitte reagieren Sie nicht auf solche E-Mails,
        es könnte sich um einen Phishing-Versuch handeln.
        
        Link zum Portal: ${config.deployment.frontendURL}
        Bei Fragen wenden Sie sich bitte an: ${config.email.supportEmail}
      
        Freundliche Grüße
        Ihr ${config.deployment.projectName}-Team
  
        Diese E-Mail wurde automatisch erstellt, bitte antworten Sie nicht darauf.
            `;

    case EmailType.USER_REGISTERED_EMAIL_TO_SUPERUSER:
      return `Hallo Frau/Herr ${user.lastName},
    
        Ein neuer Nutzer mit dem Namen ${user.firstName} ${user.lastName}
        und der E-Mail-Adresse ${user.email}
        hat sich auf dem ${config.deployment.projectName} angemeldet. 
        Bitte melden Sie sich bei Portal an, um die Details zum Nutzer zu sehen
        und das Portal für den Nutzer freizuschalten.      

        Link zum Portal: ${config.deployment.frontendURL}
        Bei Fragen wenden Sie sich bitte an: ${config.email.supportEmail}
      
        Freundliche Grüße
        Ihr ${config.deployment.projectName}-Team
  
        Diese E-Mail wurde automatisch erstellt, bitte antworten Sie nicht darauf.
            `;

    case EmailType.REGISTRATION_APPROVAL_EMAIL_TO_USER:
      return `Hallo Frau/Herr ${user.lastName},

        wir haben Ihre Daten geprüft. Sie sind nun für das ${config.deployment.projectName}-Portal freigeschaltet.
        Sie können ab sofort die verfügbaren Produkte kaufen.  

        Wichtiger Hinweis: Wir werden Sie nie dazu auffordern, persönliche Daten per E-Mail zu versenden oder über einen Link zu aktualisieren.
        Bitte reagieren Sie nicht auf solche E-Mails,
        es könnte sich um einen Phishing-Versuch handeln.
        
        Sollten Sie diese E-Mail grundlos erhalten haben, brauchen Sie nicht zu reagieren. 
        
        Link zum Portal: ${config.deployment.frontendURL}
        Bei Fragen wenden Sie sich bitte an: ${config.email.supportEmail}
      
        Freundliche Grüße
        Ihr ${config.deployment.projectName}-Team
  
        Diese E-Mail wurde automatisch erstellt, bitte antworten Sie nicht darauf.
            `;

    case EmailType.REGISTRATION_DECLINATION_EMAIL_TO_USER:
      return `Hallo Frau/Herr ${user.lastName},

        wir haben Ihre Daten geprüft. Leider müssen wir Ihnen mitteilen,
        dass Ihre Registrierungsanfrage abgelehnt wurde.
    
        Wichtiger Hinweis: Wir werden Sie nie dazu auffordern, persönliche Daten per E-Mail zu versenden oder über einen Link zu aktualisieren.
        Bitte reagieren Sie nicht auf solche E-Mails,
        es könnte sich um einen Phishing-Versuch handeln.
        
        Sollten Sie diese E-Mail grundlos erhalten haben, brauchen Sie nicht zu reagieren. 
        
        Link zum Portal: ${config.deployment.frontendURL}
        Bei Fragen wenden Sie sich bitte an: ${config.email.supportEmail}
      
        Freundliche Grüße
        Ihr ${config.deployment.projectName}-Team
  
        Diese E-Mail wurde automatisch erstellt, bitte antworten Sie nicht darauf.
            `;

    case EmailType.REGISTRATION_REQUEST_RECEIVED_EMAIL_TO_USER:
      return `Hallo Frau/Herr ${user.lastName},

        das ${config.deployment.projectName}-Team prüft nun Ihre Registrierungsanfrage.
        Sie erhalten eine weitere E-Mail sobald Sie freigeschaltet sind.

        Ihr Benutzername: ${user.username}
        Ihre E-Mail-Adresse: ${user.email}

        Sie können das Portal nach der Freischaltung nutzen.
  
        Wichtiger Hinweis: Wir werden Sie nie dazu auffordern, persönliche Daten per E-Mail zu versenden oder über einen Link zu aktualisieren.
        Bitte reagieren Sie nicht auf solche E-Mails,
        es könnte sich um einen Phishing-Versuch handeln.
        
        Sollten Sie diese E-Mail grundlos erhalten haben, brauchen Sie nicht zu reagieren. 
        
        Link zum Portal: ${config.deployment.frontendURL}
        Bei Fragen wenden Sie sich bitte an: ${config.email.supportEmail}
      
        Freundliche Grüße
        Ihr ${config.deployment.projectName}-Team
  
        Diese E-Mail wurde automatisch erstellt, bitte antworten Sie nicht darauf.
            `;

    case EmailType.ACCOUNT_DELETED:
      return `Hallo Frau/Herr ${user.lastName},

        Ihr Konto wurde gelöscht. 
        
        Wichtiger Hinweis: Wir werden Sie nie dazu auffordern, persönliche Daten per E-Mail zu versenden oder über einen Link zu aktualisieren.
        Bitte reagieren Sie nicht auf solche E-Mails,
        es könnte sich um einen Phishing-Versuch handeln.
        
        Sollten Sie diese E-Mail grundlos erhalten haben, brauchen Sie nicht zu reagieren. 
        
        Link zum Portal: ${config.deployment.frontendURL}
        Bei Fragen wenden Sie sich bitte an: ${config.email.supportEmail}
      
        Freundliche Grüße
        Ihr ${config.deployment.projectName}-Team
  
        Diese E-Mail wurde automatisch erstellt, bitte antworten Sie nicht darauf.
            `;

    case EmailType.MONTHLY_INVOICE:
      return `Hallo Frau/Herr ${user.lastName},

        

        `;

    // Sie haben eine Rechnung für den Monat ${moment(invoice.month).format('MMMM YYYY')} erhalten.

    // Ihr Konto: ${user.username}
    // Ihre E-Mail-Adresse: ${user.email}
    // Rechnungsnummer: ${invoice.number}
    // Rechnungsdatum: ${moment(invoice.date).format('DD.MM.YYYY')}
    // Betrag: ${invoice.amount} €
  }
};

// eslint-disable-next-line
const generateEmailTextForEnglish = (emailType: EmailType, user: User) => {
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

    case EmailType.MONTHLY_INVOICE:
      return ``;
  }
};

export const generateEmailText = async (emailType: EmailType, user: User) => {
  switch (user.language) {
    // case 'de-DE':
    //   return await generateEmailTextForGerman(emailType, user);
    //   break;

    // default: //
    //   //'en-US'
    //   return generateEmailTextForEnglish(emailType, user);
    //   break;

    default:
      return await generateEmailTextForGerman(emailType, user);
      break;
  }
};
