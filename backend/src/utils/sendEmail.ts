import nodemailer from 'nodemailer';

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
}

const sendEmail = async (options: EmailOptions) => {
  // Create a transporter using Nodemailer
  // In a real application, replace these with your actual SMTP credentials or service provider (like SendGrid, Resend, etc.)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '2525', 10),
    auth: {
      user: process.env.SMTP_USER || 'user',
      pass: process.env.SMTP_PASSWORD || 'password',
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || 'Railway Tracking System'} <${process.env.FROM_EMAIL || 'noreply@railwaytracking.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
};

export default sendEmail;
