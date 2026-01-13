const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Files require
const connectDB = require('./config/mongodb');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors({ credentials: true }));
app.use(cookieParser());

// DB CONNECT
connectDB();

// routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server listening on- http://localhost:${process.env.PORT}`);
});