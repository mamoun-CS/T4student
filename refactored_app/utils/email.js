import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Helper function to send email verifications
const sendVerificationEmail = async (toEmail, verificationCode) => {
    try {
        const info = await transporter.sendMail({
            from: `"T4Student" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: 'Email Verification',
            text: `Your verification code is: ${verificationCode}`,
        });

        console.log('Email sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

export default sendVerificationEmail;
