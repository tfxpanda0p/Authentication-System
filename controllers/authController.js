const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const transporter = require('../config/nodemailer');


const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({ success: false, message: 'Missing details' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ success: false, message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ?
                'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        // Welcome Email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Team Fusion X',
            text: `Hi, ${name} Welcome to our website, Owner Loves you alot.By using this email ${email} account is created`
        }
        await transporter.sendMail(mailOptions);
        return res.json({ success: true, message: 'Registation done' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Missing details"
        });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User doesn't exist"
            });
        }

        const verifiedPassword = await bcrypt.compare(password, user.password);

        if (!verifiedPassword) {
            return res.status(400).json({
                success: false,
                message: "Wrong password"
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ?
                "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            message: "Logged in successfully"
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ?
                'none' : 'strict',
        });
        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const sendVerifyOtp = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        if (user.isVerify) {
            return res.json({ success: false, message: 'Account already verify' });
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        console.log(otp);

        user.verifyOtp = otp;
        user.verifyOtpExprireAt = Date.now() + 24 * 60 * 60 * 1000;

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verificatin OTP',
            text: `Hi ${user.name}, Your account verification otp: ${otp}`
        }

        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: `Verificatin OTP sent on email:${user.email}` });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const verifyEmail = async (req, res) => {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
        return res.json({ success: false, message: 'Missing info' });
    }
    try {
        const user = await User.findById(userId);

        if (!user) {
            res.status(400).json({ success: false, message: 'User not found' });
        }

        if (user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.json({ success: false, message: 'Invaild OTP' });
        }

        if (user.verifyOtpExprireAt < Date.now()) {
            return res.json({ success: false, message: 'OTP Expired' });
        }
        user.isVerify = true;
        user.verifyOtp = '';
        user.verifyOtpExprireAt = 0;

        await user.save();
        return res.json({ success: true, message: 'Email verified successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// check user auth or not
const isAuth = async (req, res) => {
    try {
        return res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// send password reset
const sendResetOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.json({ success: false, message: 'Email is required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'Email dont exist' });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExprireAt = Date.now() + 15 * 60 * 1000;

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password reset OTP',
            text: `Hi ${user.name}, Your account's password reset otp: ${otp}`
        }

        await transporter.sendMail(mailOptions);

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.json({ success: false, message: 'Email , Otp & newPassword are required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'Email dont exist' });
        }

        if (user.resetOtp === '' || user.resetOtp !== otp) {
            return res.json({ success: false, message: 'Invaild Otp' });
        }

        if (user.resetOtpExprireAt < Date.now()) {
            return res.json({ success: false, message: 'Expired Otp' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;

        user.resetOtp = '';

        user.resetOtpExprireAt = 0;

        await user.save();

        return res.json({ success: true, message: 'Password has been reset successfully' });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }

};

module.exports = { register, login, logout, sendVerifyOtp, verifyEmail, isAuth, sendResetOtp, resetPassword };