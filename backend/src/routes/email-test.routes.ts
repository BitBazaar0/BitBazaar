import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { sendEmail, getVerificationEmail } from '../utils/email.service';
import logger from '../utils/logger';

const router = express.Router();

/**
 * Test email configuration endpoint
 * GET /api/test-email?to=your@email.com
 * Only works in development mode for security
 */
router.get('/test-email', async (req, res) => {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      status: 'error',
      message: 'Email testing is only available in development mode'
    });
  }

  const { to } = req.query;

  if (!to || typeof to !== 'string') {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide an email address: /api/test-email?to=your@email.com'
    });
  }

  try {
    const emailSent = await sendEmail({
      to,
      subject: 'BitBazaar Email Test',
      html: `
        <h1>Email Test Successful!</h1>
        <p>If you received this email, your email configuration is working correctly.</p>
        <p>Test sent at: ${new Date().toLocaleString()}</p>
      `
    });

    if (emailSent) {
      res.json({
        status: 'success',
        message: `Test email sent successfully to ${to}. Please check your inbox (and spam folder).`
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to send test email. Check server logs for details. If using Outlook.com, see MICROSOFT_SMTP_DISABLED.md for solution.'
      });
    }
  } catch (error: any) {
    logger.error('Email test error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to send test email'
    });
  }
});

export default router;

