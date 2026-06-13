import nodemailer from "nodemailer";
import { env } from "~/env";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: parseInt(env.SMTP_PORT),
  secure: env.SMTP_PORT === "465",
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
});

export const sendEmail = async ({ to, subject, html, fromName = "DB Manager Info" }: { to: string; subject: string; html: string; fromName?: string }) => {
  try {
    await transporter.sendMail({
      from: `"${fromName}" <${env.SMTP_FROM}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
};
