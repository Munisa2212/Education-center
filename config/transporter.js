const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "boltaboyevnurali218@gmail.com",
    pass: "syja ewuo lchs sdvg",
  },
});

async function sendEmail(email, otp) {
    try {
      await transporter.sendMail({
        to: email,
        subject: "verify auth",
        from: "boltaboyevnurali55@gmail.com",
        text: `Your one time password is ${otp}`
      });
      console.log("Sended to email");
    } catch (error) {
      console.log((error));
    }
}

module.exports = {transporter, sendEmail}