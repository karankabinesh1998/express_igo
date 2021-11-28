require('dotenv').config();

const Envreader = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  HOST: process.env.HOST,
  PROJECTNAME: process.env.PROJECTNAME,
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.DB_NAME,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_TIMEZONE: process.env.DB_TIMEZONE,
  FACTOR_API_KEY:process.env.FACTOR_API_KEY,
  RAZORPAY_SECRET:process.env.RAZORPAY_SECRET,
  RAZORPAY_KEY_ID:process.env.RAZORPAY_KEY_ID,
  TESTRAZORPAY_SECRET:process.env.TESTRAZORPAY_SECRET,
  TESTRAZORPAY_KEY_ID:process.env.TESTRAZORPAY_KEY_ID
};

module.exports = Envreader;