const nodemailer = require("nodemailer");

/**
 * Interface EmailService - Responsabilité unique : Gérer l'envoi d'emails
 * Principe ISP : Le contrôleur n'a besoin que de cette interface
 * pour envoyer les emails, pas de toute la logique métier
 */
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "bouazzadoua03@gmail.com",
        pass: "wvio qrbh wymt lcgj",
      },
    });
  }

  async sendVerificationEmail(toEmail, verificationLink) {
    try {
      const mailOptions = {
        from: "benameur808@gmail.com",
        to: toEmail,
        subject: "Veuillez vérifier votre e-mail",
        html: `<p>Cliquez sur le lien suivant pour vérifier votre e-mail :</p><p><a href="${verificationLink}">${verificationLink}</a></p>`,
      };

      await this.transporter.sendMail(mailOptions);
      console.log("Verification email sent to:", toEmail);
      return true;
    } catch (error) {
      console.error("Error sending verification email:", error);
      throw error;
    }
  }

  async sendPasswordResetEmail(toEmail, resetLink) {
    try {
      const mailOptions = {
        from: "benameur808@gmail.com",
        to: toEmail,
        subject: "Réinitialisation de votre mot de passe",
        html: `<p>Cliquez sur le lien suivant pour réinitialiser votre mot de passe :</p><p><a href="${resetLink}">${resetLink}</a></p>`,
      };

      await this.transporter.sendMail(mailOptions);
      console.log("Password reset email sent to:", toEmail);
      return true;
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    }
  }
}

module.exports = new EmailService();
