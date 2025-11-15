import nodemailer from 'nodemailer';
import logger from './logger';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

const createTransporter = (): nodemailer.Transporter | null => {
  if (transporter) return transporter;

  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const emailHost = process.env.EMAIL_HOST;
  const emailPort = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 587;

  // If no email config, return null (emails won't send but won't crash)
  if (!emailUser || !emailPassword) {
    if (process.env.NODE_ENV === 'production') {
      logger.warn('Email service not configured. Email functionality disabled.');
    }
    return null;
  }

  // Configure transporter based on service
  const config: any = {
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  };

  if (emailService === 'smtp') {
    config.host = emailHost || 'smtp.gmail.com';
    config.port = emailPort || 587;
    config.secure = emailPort === 465;
    config.requireTLS = emailPort === 587; // Require TLS for port 587
  } else if (emailService === 'gmail') {
    config.service = 'gmail';
  } else if (emailService === 'outlook' || emailService === 'office365') {
    // Determine if it's Outlook.com (personal) or Office 365 (business)
    const isOutlookCom = emailUser?.includes('@outlook.com') || emailUser?.includes('@hotmail.com') || emailUser?.includes('@live.com');
    
    if (isOutlookCom) {
      // Outlook.com (personal) - uses smtp-mail.outlook.com
      config.host = 'smtp-mail.outlook.com';
    } else {
      // Office 365 (business/corporate)
      config.host = 'smtp.office365.com';
    }
    
    config.port = 587;
    config.secure = false; // Use STARTTLS, not SSL
    config.requireTLS = true;
    // For Outlook, EMAIL_USER should be the full email address
    config.auth.user = emailUser;
    config.auth.pass = emailPassword;
  } else if (emailService === 'sendgrid') {
    config.host = 'smtp.sendgrid.net';
    config.port = 587;
    config.auth.user = 'apikey';
    config.auth.pass = emailPassword; // SendGrid API key
  } else if (emailService === 'resend') {
    config.host = 'smtp.resend.com';
    config.port = 587;
    config.auth.pass = emailPassword; // Resend API key
  }

  transporter = nodemailer.createTransport(config);
  return transporter;
};

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: SendEmailOptions): Promise<boolean> => {
  try {
    const emailTransporter = createTransporter();
    
    if (!emailTransporter) {
      logger.warn(`Email service not configured. Failed to send email to: ${options.to}`);
      return false;
    }

    const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@bitbazaar.com';
    const fromName = process.env.EMAIL_FROM_NAME || 'BitBazaar';

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    const info = await emailTransporter.sendMail(mailOptions);
    logger.info(`Email sent to ${options.to} (${info.messageId})`);
    return true;
  } catch (error: any) {
    // Check for common Outlook.com errors and provide helpful message
    if (error.message?.includes('basic authentication is disabled')) {
      logger.error(`Failed to send email to ${options.to}: Microsoft disabled basic auth for Outlook.com. See MICROSOFT_SMTP_DISABLED.md`);
    } else {
      logger.error(`Failed to send email to ${options.to}: ${error.message || error}`);
    }
    return false;
  }
};

// Email templates
export const getVerificationEmail = (token: string, username: string): string => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1976d2; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #1976d2; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to BitBazaar!</h1>
        </div>
        <div class="content">
          <h2>Hi ${username},</h2>
          <p>Thank you for signing up! Please verify your email address to complete your registration.</p>
          <p>Click the button below to verify your email:</p>
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #1976d2;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} BitBazaar. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const getPasswordResetEmail = (token: string, username: string): string => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #d32f2f; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #d32f2f; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hi ${username},</h2>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #d32f2f;">${resetUrl}</p>
          <div class="warning">
            <strong>⚠️ Important:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} BitBazaar. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const getNewMessageEmail = (senderName: string, listingTitle: string, messagePreview: string, chatUrl: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1976d2; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #1976d2; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .message-box { background: white; padding: 15px; border-left: 4px solid #1976d2; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Message on BitBazaar</h1>
        </div>
        <div class="content">
          <h2>You have a new message!</h2>
          <p><strong>${senderName}</strong> sent you a message about:</p>
          <p style="font-weight: bold; color: #1976d2;">${listingTitle}</p>
          <div class="message-box">
            <p>${messagePreview}</p>
          </div>
          <a href="${chatUrl}" class="button">View Message</a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #1976d2;">${chatUrl}</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} BitBazaar. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const getListingInquiryEmail = (buyerName: string, listingTitle: string, message: string, listingUrl: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1976d2; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #1976d2; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .message-box { background: white; padding: 15px; border-left: 4px solid #1976d2; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Inquiry on Your Listing</h1>
        </div>
        <div class="content">
          <h2>Someone is interested in your listing!</h2>
          <p><strong>${buyerName}</strong> sent you a message about:</p>
          <p style="font-weight: bold; color: #1976d2;">${listingTitle}</p>
          <div class="message-box">
            <p>${message}</p>
          </div>
          <a href="${listingUrl}" class="button">View Listing & Respond</a>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} BitBazaar. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

