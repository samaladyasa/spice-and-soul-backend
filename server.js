const express = require('express');
const bodyParser = require('body-parser');
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from parent directory (where all HTML, CSS, JS files are)
app.use(express.static(path.join(__dirname, '..')));

// In-memory store for verification codes (in production, use a database)
const verificationCodes = {};

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your_email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your_app_password'
    }
});

// Verify email configuration
transporter.verify((error, success) => {
    if (error) {
        console.log('⚠️  Email not configured:', error.message);
        console.log('📧 To enable email, update .env file with Gmail App Password');
    } else {
        console.log('✓ Email service ready');
    }
});

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_RAZORPAY_KEY_SECRET'
});

const { forgotPassword } = require('./src/auth/cognitoForgotPassword');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Password Reset - Send Verification Code
app.post('/send-reset-code', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const users = JSON.parse(require('fs').readFileSync(path.join(__dirname, '../userData.json'), 'utf8') || '[]');
    const userExists = users.find(u => (u.email || '').toLowerCase() === email);
    
    if (!userExists) {
        return res.status(400).json({ error: 'No account found with this email' });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code with expiry (1 hour)
    verificationCodes[email.toLowerCase()] = {
        code: verificationCode,
        expiry: Date.now() + (3600000) // 1 hour
    };

    console.log(`📝 Reset code for ${email}: ${verificationCode}`);

    // Email content
    const mailOptions = {
        from: process.env.EMAIL_USER || 'your_email@gmail.com',
        to: email,
        subject: 'Password Reset Code - Spice & Soul',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #d35400;">Password Reset Request</h2>
                <p>Hello,</p>
                <p>You requested to reset your password for your Spice & Soul account. Please use the code below to proceed:</p>
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #d35400; letter-spacing: 5px; margin: 0;">${verificationCode}</h1>
                </div>
                <p><strong>This code will expire in 1 hour.</strong></p>
                <p>If you didn't request a password reset, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #666; font-size: 12px;">© 2026 Spice & Soul Restaurant. All rights reserved.</p>
            </div>
        `
    };

    // Try to send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('⚠️  Email sending failed:', error.message);
            console.log('💡 Tip: Configure Gmail credentials in .env file to send real emails');
            
            // Still return success since code is stored server-side
            return res.json({
                success: true,
                message: 'Verification code sent to your email (check server console for code during testing)'
            });
        }

        console.log('✓ Email sent successfully to:', email);
        res.json({
            success: true,
            message: 'Verification code sent to your email'
        });
    });
});

// Verify Reset Code
app.post('/verify-reset-code', (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ error: 'Email and code are required' });
    }

    const emailLower = email.toLowerCase();
    const storedData = verificationCodes[emailLower];

    if (!storedData) {
        return res.status(400).json({ error: 'No verification code found. Please request a new code.' });
    }

    if (Date.now() > storedData.expiry) {
        delete verificationCodes[emailLower];
        return res.status(400).json({ error: 'Verification code has expired. Please try again.' });
    }

    if (storedData.code !== code.trim()) {
        return res.status(400).json({ error: 'Invalid verification code. Please try again.' });
    }

    // Code is valid
    console.log('✓ Code verified for:', email);
    res.json({
        success: true,
        message: 'Code verified successfully'
    });
});

// Reset Password
app.post('/reset-password', (req, res) => {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
        return res.status(400).json({ error: 'Email, code, and new password are required' });
    }

    const emailLower = email.toLowerCase();

    // Verify code again
    const storedData = verificationCodes[emailLower];
    if (!storedData || storedData.code !== code.trim() || Date.now() > storedData.expiry) {
        return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    try {
        // Read users from localStorage (simulated with JSON file)
        const fs = require('fs');
        const usersFile = path.join(__dirname, '../userData.json');
        let users = [];
        
        try {
            const data = fs.readFileSync(usersFile, 'utf8');
            users = JSON.parse(data);
        } catch (e) {
            // File doesn't exist yet
            users = [];
        }

        // Find and update user password
        const userIndex = users.findIndex(u => (u.email || '').toLowerCase() === emailLower);
        if (userIndex >= 0) {
            users[userIndex].password = newPassword;
            fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
        }

        // Clear the verification code
        delete verificationCodes[emailLower];

        console.log('✓ Password reset successfully for:', email);
        res.json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'Error resetting password. Please try again.' });
    }
});

// AWS Cognito Forgot Password Endpoint
app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    try {
        await forgotPassword(email);
        res.json({ success: true, message: 'Password reset code sent to your email' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/create-order', (req, res) => {
    const options = {
        amount: req.body.amount, // amount in the smallest currency unit
        currency: 'INR',
        receipt: 'receipt#1',
    };
    razorpay.orders.create(options, (err, order) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.json(order);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
