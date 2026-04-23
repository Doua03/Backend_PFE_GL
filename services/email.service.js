const nodemailer = require('nodemailer');

class EmailService {
  static #transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'bouazzadoua03@gmail.com',
      pass: 'wvio qrbh wymt lcgj'
    }
  });

  static async sendVerification(toEmail, verificationLink) {
    const mailOptions = {
      from: 'benameur808@gmail.com',
      to: toEmail,
      subject: 'Veuillez vérifier votre e-mail',
      html: `
        <p>Cliquez sur le lien suivant pour vérifier votre e-mail :</p>
        <p><a href="${verificationLink}">${verificationLink}</a></p>
      `
    };

    await this.#transporter.sendMail(mailOptions);
    console.log('Verification email sent');
  }
}

module.exports = EmailService;