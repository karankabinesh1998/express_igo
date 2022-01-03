const Model = require('../Model');
const { endConnection } = require('../dataBaseConnection');
const chalk = require("chalk");
const { FACTOR_API_KEY, RAZORPAY_SECRET, RAZORPAY_KEY_ID, TESTRAZORPAY_KEY_ID, TESTRAZORPAY_SECRET } = require('../Envreader');
const fs = require("fs");
var admin = require("firebase-admin");
var serviceAccount = require("./igotaxy-firebase-adminsdk-2c5sg-2a09a1a5ee.json");
const TwoFactor = new (require('2factor'))(FACTOR_API_KEY);
const Razorpay = require("razorpay");
let crypto = require("crypto");
const moment = require('moment');
const bcrypt = require('bcrypt');

const passwordEncrypt = (password) => {
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);
  if(hash){
    return hash;
  }
};

const passwordDecrypt = (password,hash)=>{
  const checkPassword = bcrypt.compareSync(password, hash);
  return checkPassword;
};

const loginUser = async(req,res,next)=>{
  try {
    const condition = req?.body?.email_id ? 'email_id' : 'mobile'
    const result = await Model.getAllData(
      `id,password,username,email_id,mobile`,
      `tbl_user_web`,
      `${condition}='${req?.body?.mobile}'`
    );
    if(result?.length){
      const passwordCheck = passwordDecrypt(req?.body?.password,result[0]?.password);
      if(passwordCheck){
          res.status(200).send(result);
      } else{
        res.status(400).send(`Incorrect password`);
      }
    }else{
      res.status(400).send(`Incorrect ${condition}`);
    }
    endConnection();
  } catch (error) {
    endConnection();
    console.log(chalk.red(error));
    res.status(500).send("General Server Error");
  }
}

const addUser = async (req, res, next) => {
  try {
    let insertData = req?.body;
    insertData.password = passwordEncrypt(insertData?.password);
    const result = await Model.addMaster(
      `tbl_user_web`,
      insertData
    );
    if (result) {
      res.status(200).send(result);
    } else {
      res.status(500).send("something went wrong");
    }
    endConnection();
  } catch (error) {
    endConnection();
    console.log(chalk.red(error));
    res.status(500).send("General Server Error");
    // next(error);
  }
};


module.exports = {
  addUser,
  loginUser
}