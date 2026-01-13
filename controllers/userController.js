const User = require('../models/User');

const getUserDate = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            userData: {
                name: user.name,
                isVerify: user.isVerify,
            }
        });

    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};


module.exports = {
    getUserDate
};