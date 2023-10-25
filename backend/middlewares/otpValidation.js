import dotenv from "dotenv";
import nodemailer from "nodemailer";
import Mailgen from "mailgen";

dotenv.config();

export const sendEmail = async function (email) {
  let randomOTP = Math.floor(Math.random() * 9000) + 1000;

  // Create a transporter object using your Gmail SMTP settings
  let transporter = nodemailer.createTransport({
    service: "gmail",
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME, // Your Gmail email address
      pass: process.env.EMAIL_PASSWORD, // Your Gmail password or an app-specific password
    },
  });

  let MailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Kaadan Esports",
      link: "http://mailgen.js",
    },
  });
  let response = {
    body: {
      intro: `Your OTP is ${randomOTP}`,
    },
  };
  const MAIL = MailGenerator.generate(response);
  // Define email data
  let mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: "OTP Verification",
    // text: `Your OTP is ${randomOTP}`,
    html: MAIL,
  };

  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log("OTP email sent:", info.response);

    // Return the OTP
    return randomOTP;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to send OTP email");
  }
};
