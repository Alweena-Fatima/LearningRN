import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "alweenasabir123@gmail.com", // Your generic project email
    pass: "jwzq wgve uwaf zbpt",   // Your Gmail App Password
  },
});

export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: '"Campus Event App" <alweenasabir123@gmail.com>',
    to: email,
    subject: "Verify your account - IGDTUW Events",
    text: `Your verification code is: ${otp}. It expires in 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};