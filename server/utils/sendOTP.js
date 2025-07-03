const nodemailer = require('nodemailer');
const twilio = require('twilio');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Optional: Twilio configuration here

async function sendOTP(destination, code) {
  const isEmail = destination.includes('@');

  if (isEmail) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: destination,
      subject: 'Your password reset code',
      text: `Your password reset code is: ${code} (valid for 10 minutes)`
    };
    return transporter.sendMail(mailOptions);
  } else {
    // SMS sending via Twilio (example)
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    return client.messages.create({
      body: `Your password reset code is: ${code} (valid for 10 minutes)`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: destination
    });
  }
}

module.exports = sendOTP;
