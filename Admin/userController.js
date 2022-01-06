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


const randomString = () => {
  let chars = '0123456789abcdefghijklmnopqrstuvwxABCDEFGHIJKLMNOPQRSTUVWXYZ@!#$%&*';
  let length = 30;
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

const checkUserLogIn = async (login_token) => {
  try {
    const result = await Model.getAllData(
      `*`, `tbl_login_session`, `login_token = '${login_token}'`, 1, 1
    );
    if (result.length) {
      const userDetails = await Model.getAllData(
        `id`,
        `tbl_user_web`,
        `id = ${result?.[0]?.user_id} and status = 1 and userType = 4`
      );
      if(userDetails.length){
        return userDetails;
      }else{
        return false;
      }
    } else {
      return false
    };
  } catch (error) {
    return error;
  }
};

const userAccountDetails = async(req,res,next)=>{
  try {
    const userCheck = await checkUserLogIn(req?.headers?.authorization);
    if (userCheck == false) {
      res.send(401).send("No user Login found");
      return;
    };
    const userDetails = await Model.getAllData(
      `first_name,last_name,mobile,email_id`,
      `tbl_user_web`,
      `id=${userCheck[0].id} and status = 1 and userType=4`
    );
    if(!userDetails.length){
      res.send(401).send("No user Login found");
      return;
    }else{
      res.send(200).send(userDetails);
    }
    endConnection();
  } catch (error) {
    endConnection();
    console.log(chalk.red(error));
    res.status(500).send("General Server Error");
  }
}

const userLogOut = async (req, res, next) => {
  try {
    const loginToken = req?.headers?.authorization;
    const deleteTokenSession = await Model.deleteMasterfromTable(
      `tbl_login_session`,
      `login_token='${loginToken}'`
    );
    if (!deleteTokenSession) {
      res.status(401).json({ error: "no login session found" });
    } else {
      const updateUserLoginStatus = Model.updateMaster(
        `tbl_user_web`,
        deleteTokenSession[0]?.user_id,
        { login_status: 0, loginToken: null }
      );
      if(updateUserLoginStatus){
        res.status(200).send("successfully logged out")
      }else{
        res.status(401).json({ error: "no login session found" })
      }
    }
    endConnection();
  } catch (error) {
    endConnection();
    console.log(chalk.red(error));
    res.status(500).send("General Server Error");
  }
};

const passwordEncrypt = (password) => {
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);
  if (hash) {
    return hash;
  }
};

const passwordDecrypt = (password, hash) => {
  const checkPassword = bcrypt.compareSync(password, hash);
  console.log(checkPassword, 'check');
  return checkPassword;
};

const loginUser = async (req, res, next) => {
  try {
    console.log(req?.body);
    const result = await Model.getAllData(
      `id,password,username,email_id,mobile`,
      `tbl_user_web`,
      `mobile='${req?.body?.mobile}' and userType = 4 and status =1`
    );
    if (result?.length) {
      const passwordCheck = passwordDecrypt(req?.body?.password, result[0]?.password);
      if (passwordCheck) {
        const login_token = randomString();
        const updateLogin = await Model.updateMaster(
          `tbl_user_web`,
          result[0]?.id,
          { login_status: 1, login_token: login_token }
        );
        if (updateLogin) {
          const insertLoginSession = await Model.addMaster(
            `tbl_login_session`,
            { user_id: result[0]?.id, login_token: login_token }
          );
          if (insertLoginSession) {
            result[0].login_token = login_token;
            delete result[0]?.password;
            delete result[0]?.id;
            res.status(200).send(result);
          } else {
            res.status(400).json({ error: 'something went wrong!!' });
          }

        } else {
          res.status(400).json({ error: 'something went wrong!!' });
        }
      } else {
        res.status(400).json({ error: `Incorrect password` });
      }
    } else {
      res.status(400).json({ error: `Incorrect mobile` });
    }
    endConnection();
  } catch (error) {
    endConnection();
    console.log(chalk.red(error));
    res.status(500).send("General Server Error");
  }
};

const addUser = async (req, res, next) => {
  try {
    let insertData = req?.body;
    const checkUser = await Model.getAllData(
      `id`,
      `tbl_user_web`,
      `email_id='${req?.body?.email_id}' OR mobile='${req?.body?.mobile}' and status = 1 and userType = 4`
    );
    if (checkUser?.length) {
      res.status(409).json({ error: "User Mobile or Email Already Exists" });
      return;
    };
    insertData.password = passwordEncrypt(insertData?.password);
    insertData.status = 1;
    insertData.userType = 4;
    const result = await Model.addMaster(
      `tbl_user_web`,
      insertData
    );
    if (result) {
      res.status(200).send(result);
    } else {
      res.status(500).json({ error: "something went wrong" });
    }
    endConnection();
  } catch (error) {
    endConnection();
    console.log(chalk.red(error));
    res.status(500).json("General Server Error");
  }
};


module.exports = {
  addUser,
  loginUser,
  userLogOut,
  userAccountDetails
}