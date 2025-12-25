// Email service
// Handles email sending operations

import nodemailer from 'nodemailer';
import emailConfig from '../config/email.js';
import logger from '../utils/logger.js';

let transporter;

export const initializeEmailService = () => {
  transporter = nodemailer.createTransport(emailConfig.smtp);
};

export const sendEmail = async (to, subject, html) => {
  try {
    if (!transporter) {
      initializeEmailService();
    }

    const info = await transporter.sendMail({
      from: emailConfig.from,
      to,
      subject,
      html,
    });

    logger.info('Email sent:', { to, subject, messageId: info.messageId });
    return info;
  } catch (error) {
    logger.error('Email sending failed:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (to, resetToken) => {
  // TODO: Implement password reset email template
};

export const sendWelcomeEmail = async (to, name) => {
  // TODO: Implement welcome email template
};
