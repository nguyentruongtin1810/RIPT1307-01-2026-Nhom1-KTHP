const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromAddress = process.env.EMAIL_FROM || "no-reply@admission.example.com";

const transportOptions = smtpHost
  ? {
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined
    }
  : { jsonTransport: true };

const transporter = nodemailer.createTransport(transportOptions);

async function sendApplicationStatusChangeEmail(candidateEmail, candidateName, status, applicationId) {
  const subject = `Cập nhật trạng thái hồ sơ xét tuyển`;
  const text = `Xin chào ${candidateName},\n\nTrạng thái hồ sơ xét tuyển của bạn đã được cập nhật thành: ${status}.\nMã hồ sơ: ${applicationId}.\n\nTrân trọng,\nBan tuyển sinh.`;
  const html = `<p>Xin chào <strong>${candidateName}</strong>,</p>
    <p>Trạng thái hồ sơ xét tuyển của bạn đã được cập nhật thành: <strong>${status}</strong>.</p>
    <p>Mã hồ sơ: <strong>${applicationId}</strong></p>
    <p>Trân trọng,<br/>Ban tuyển sinh</p>`;

  const info = await transporter.sendMail({
    from: fromAddress,
    to: candidateEmail,
    subject,
    text,
    html
  });

  console.log("Email notification sent:", info.messageId || info);
  return info;
}

module.exports = { sendApplicationStatusChangeEmail };
