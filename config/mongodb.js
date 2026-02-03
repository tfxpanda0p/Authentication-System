const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        mongoose.connect(process.env.MONGO_URL)
            .then(() => console.log("Connected to MongoDB"))
            .catch((err) => console.log(err));
    } catch (err) {
        console.log(err);
    }

}

module.exports = connectDB;