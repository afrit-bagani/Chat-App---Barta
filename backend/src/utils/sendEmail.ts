import nodemailer from "nodemailer";

export async function sendVerificationEmail(email: string, token: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  await transporter
    .verify()
    .then(() => console.log("SMTP Server is ready to take our messages"))
    .catch(() => console.error("SMTP Server is not ready to take message"));
  const verifyLink = `${process.env.ORIGIN}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: '"Barta" <no-reply@barta.com>',
    to: email,
    subject: "Please verify your email",
    html: `<p>Click <a href=${verifyLink}>here<a/> to verify you email address<p/>`,
  });
}
