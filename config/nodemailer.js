const nodemailer = require('nodemailer');

let transporter;

try {
    transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false, // true for 465, false for 587
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    // Optional but recommended: verify connection
    transporter.verify((error, success) => {
        if (error) {
            console.error('SMTP verification failed:', error.message);
        } else {
            console.log('SMTP server is ready to send emails');
        }
    });

} catch (error) {
    console.error('Error creating Nodemailer transporter:', error.message);
}

module.exports = transporter;