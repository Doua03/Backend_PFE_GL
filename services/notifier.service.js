const nodemailer = require('nodemailer');

class EmailNotifier {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'bouazzadoua03@gmail.com',
        pass: 'wvio qrbh wymt lcgj'
      }
    });
  }

  async send(to, subject, message) {
    const mailOptions = {
      from: 'benameur808@gmail.com',
      to: to,
      subject: subject,
      text: message
    };
    return await this.transporter.sendMail(mailOptions);
  }
}

module.exports = { EmailNotifier };
