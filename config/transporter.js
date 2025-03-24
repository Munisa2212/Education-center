const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
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
      res.status(400).send(error); 
    }
}

module.exports = {transporter, sendEmail}