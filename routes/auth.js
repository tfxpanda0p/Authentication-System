const { register, login, logout, sendVerifyOtp, verifyEmail, isAuth, sendResetOtp, resetPassword } = require('../controllers/authController');
const { userAuth } = require('../middleware/userAuth');
const router = require('express').Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/send-verify-otp', userAuth, sendVerifyOtp);
router.post('/verify-account', userAuth, verifyEmail);
router.post('/is-auth', userAuth, isAuth);
router.post('/send-reset-otp', sendResetOtp);
router.post('/reset-password', resetPassword);

module.exports = router;