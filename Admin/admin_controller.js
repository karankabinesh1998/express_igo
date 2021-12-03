const Model = require('../Model');
const { endConnection } = require('../dataBaseConnection');
const chalk = require("chalk");
const { FACTOR_API_KEY, RAZORPAY_SECRET, RAZORPAY_KEY_ID, TESTRAZORPAY_KEY_ID, TESTRAZORPAY_SECRET } = require('../Envreader');
const fs = require("fs");
var admin = require("firebase-admin");
const path = require('path')
var serviceAccount = require("./igotaxy-firebase-adminsdk-2c5sg-2a09a1a5ee.json");
const TwoFactor = new (require('2factor'))(FACTOR_API_KEY)
const wsServer = require('./webSocket');
const Razorpay = require("razorpay");
let crypto = require("crypto");
const http = require('http')
const https = require('https')
const clients = [];
const facts = [];

const eventsHandler = (request, response, next) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };
  response.writeHead(200, headers);
  const data = `data: ${JSON.stringify(facts)}\n\n`;

  response.write(data);

  const clientId = Date.now();

  const newClient = {
    id: clientId,
    response
  };

  clients.push(newClient);

  request.on('close', () => {
    console.log(`${clientId} Connection closed`);
    clients = clients.filter(client => client.id !== clientId);
  });

}


function sendEventsToAll(newFact) {
  clients.forEach(client => client.response.write(`data: ${JSON.stringify(facts)}\n\n`))
}

const OTPchecksadfsf = async (request, respsonse, next) => {

  try {



    console.log(request.body, "haskfh");
    const newFact = request.body;
    facts.push(newFact);
    respsonse.json(newFact)
    return sendEventsToAll(newFact);


    console.log("hello")
    // res.send("wsServer")

  } catch (error) {
    res.status(500)
    console.log(chalk.red(error));
    next(error)
  }
}







const sendOtp = async (req, res, next) => {

  let body = req.body;

  var val = Math.floor(100000 + Math.random() * 900000);

  try {

    let result = await Model.getAllData(
      `*`,
      `tbl_user_web`,
      `mobile = ${body.mobile} and status = 1 and userType = 3`,
      1,
      1
    )
    if (result) {
      console.log(result, "52");
      console.log(result[0].mobile, "53");
      TwoFactor.sendOTP(`${result[0].mobile}`, { otp: `${val}`, template: 'Igotaxy' }).then(async (sessionId) => {
        console.log(sessionId, "20")

        if (sessionId) {

          let updateData = await Model.updateMaster(
            `tbl_user_web`,
            result[0].id,
            { otp: val }
          )

          if (updateData) {

            res.status(200)
            res.send([{ sessionId: sessionId, otpsent: true }])

          }

        }

      }, (error) => {
        console.log(error)
      })



    } else {

      res.status(300)
      res.send(false)

    }


  } catch (error) {

    res.status(500)
    console.log(chalk.red(error));
    next(error)
  }
}

const CheckOtpandPassword = async (req, res, next) => {
  let body = req.body;
  console.log(body);
  try {

    let Checkotp = await Model.getAllData(
      `*`,
      `tbl_user_web`,
      `otp = ${body.otp}`,
      1,
      1
    )

    if (Checkotp) {

      let updatePAssword = await Model.updateMaster(
        `tbl_user_web`,
        Checkotp[0].id,
        { password: body.password, otp: null }
      )
      if (updatePAssword) {

        let result = await Model.getAllData(
          `*`,
          `tbl_user_web`,
          `id = ${Checkotp[0].id}`,
          1,
          1
        )

        if (result) {

          res.send([{ status: true }])
          res.status(200)

        }

      }

    } else {

      res.send([{ status: false }])
      res.status(200)

    }

  } catch (error) {
    res.status(500)
    console.log(chalk.red(error));
    next(error)
  }

}

// OTPcheck()

var cron = require('node-cron');
const { fail } = require('assert');
const responseTime = require('response-time');

cron.schedule('* * * * * *', () => {
  //console.log('running a task every minute');
  // ChangeTripstatus() 
});


const ChangeTripstatus = async () => {
  try {

    console.log("hello world");

    let TripData = await Model.getAllData(
      `*`,
      `tbl_trips`,
      1,
      1,
      1
    )

    if (TripData) {
      // console.log(TripData);

      let wait = await TripData.map(async (ival, i) => {

        // console.log(new Date(ival.pickup_date));
        // console.log(ival.pickup_date);

        if (ival.trip_assigned_to != null) {

          let UpdateTripStatus = await Model.updateMaster(
            `tbl_trips`,
            ival.id,
            { trip_status: "triptaken" }
          )

          if (UpdateTripStatus) {
            ///
          }

        }

      });

      await Promise.all(wait)

    }

  } catch (error) {
    console.log(error);
  }
}

admin.initializeApp({

  credential: admin.credential.cert(serviceAccount)
});


const CheckoutNotify = async (req, res, next) => {
  try {
    const Token = req.params.token;
    admin.messaging().send({
      token: Token,
      data: {
        customData: "Igotaxy",
        id: '1',
        ad: "Your Profile Approved",
        subTitle: "Notify Sub",
        routes: "NewProfile"
      },
      android: {
        notification: {
          body: " Your Documents were Approved 😊.You can now able to bid and start your Rides",
          title: "Congratulations",
          color: "#FFF566",
          priority: "high",
          sound: "default",
          vibrateTimingsMillis: [200, 500, 800],
          imageUrl: "https://images.unsplash.com/photo-1556122071-e404eaedb77f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=719&q=80"
        }
      }
    }).then((msg) => {
      res.send(msg)
      res.status(200)
    }).catch((err) => {
      res.send(err)
      res.status(404)
      console.log(err);
    })
  } catch (error) {
    console.log(error);
    res.send(false)
    res.status(500)
  }
}


const SendAssignedTripNotification = async (req, res, next) => {
  try {
    let body = req.body;
    admin.messaging().send({
      token: body.token,
      data: {
        customData: "Igotaxy",
        id: '1',
        ad: "Your Profile Approved",
        subTitle: "Notify Sub",
        routes: "MyBiddings"
      },
      android: {
        notification: {
          body: body.body,
          title: body.title,
          color: "#FFF566",
          priority: "high",
          sound: "default",
          vibrateTimingsMillis: [200, 500, 800],
          imageUrl: "https://images.unsplash.com/photo-1556122071-e404eaedb77f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=719&q=80"
          // "https://images.unsplash.com/photo-1556122071-e404eaedb77f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=719&q=80"
        }
      }
    }).then((msg) => {
      res.send(msg)
      res.status(200)
    }).catch((err) => {
      res.send(err)
      res.status(404)
    })
  } catch (error) {
    console.log(error);
    res.send(false)
    res.status(500)
  }
}


const UploadDocument1 = async (a, b, editImage = false, OldFile = null) => {

  try {
    let image = a;
    let imagename = image.name.split(".");
    let sampleFile;
    let uploadPath = "";

    if (!a.files || Object.keys(a.files).length === 0) {
      // return res.status(400).send('No files were uploaded.');
    }
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    sampleFile = a;
    Pathcheck = __dirname + '/Images/' + `/${b}/`
    uploadPath = __dirname + '/Images/' + `/${b}/` + imagename[0] + `_${Date.now()}` + '.' + imagename[1];

    sendfile = imagename[0] + `_${Date.now()}` + '.' + imagename[1];

    fs.mkdir(Pathcheck, { recursive: true }, (err) => {
      if (err) throw err;
    });
    sampleFile.mv(uploadPath, function (err) {
      if (err)
        return err;
      console.log(uploadPath);
    });

    if (editImage == true) {
      let removeFilePAth = __dirname + '/Images/' + `/${b}/` + OldFile;
      fs.unlink(removeFilePAth, function (err) {
        if (err) return console.log(err);
        console.log('file deleted successfully');
      });

    }
    return sendfile
  } catch (error) {
    console.log(error);
  }
}

const UploadDocument = async (a, b, editImage = false, OldFile = null) => {

  try {
    let image = a.file;
    let imagename = image.name.split(".");
    let sampleFile;
    let uploadPath = "";

    if (!a.files || Object.keys(a.files).length === 0) {
      // return res.status(400).send('No files were uploaded.');
    }
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    sampleFile = a.file;
    Pathcheck = __dirname + '/Images/' + `/${b}/`
    uploadPath = __dirname + '/Images/' + `/${b}/` + imagename[0] + `_${Date.now()}` + '.' + imagename[1];

    sendfile = imagename[0] + `_${Date.now()}` + '.' + imagename[1];

    fs.mkdir(Pathcheck, { recursive: true }, (err) => {
      if (err) throw err;
    });
    sampleFile.mv(uploadPath, function (err) {
      if (err)
        return err;
    });

    if (editImage == true) {
      let removeFilePAth = __dirname + '/Images/' + `/${b}/` + OldFile;
      fs.unlink(removeFilePAth, function (err) {
        if (err) return console.log(err);
        console.log('file deleted successfully');
      });
    }
    return sendfile
  } catch (error) {
    console.log(error);
  }
}

const UploadImage = async (a, editImage = false, OldFile = null) => {
  try {
    let image = a.profile_dp;
    let imagename = image.name.split(".");
    let sampleFile;
    let uploadPath = "";

    if (!a.files || Object.keys(a.files).length === 0) {
      // return res.status(400).send('No files were uploaded.');
    }
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    sampleFile = a.profile_dp;
    Pathcheck = __dirname + '/Images/UserProfile/'
    uploadPath = __dirname + '/Images/UserProfile/' + imagename[0] + `_${Date.now()}` + '.' + imagename[1];

    sendfile = imagename[0] + `_${Date.now()}` + '.' + imagename[1];

    fs.mkdir(Pathcheck, { recursive: true }, (err) => {
      if (err) throw err;
    });

    sampleFile.mv(uploadPath, function (err) {
      if (err)
        return err;
    });

    if (editImage == true) {
      let removeFilePAth = __dirname + '/Images/UserProfile/' + OldFile;
      fs.unlink(removeFilePAth, function (err) {
        if (err) return console.log(err);
        console.log('file deleted successfully');
      });
    }
    return sendfile
  } catch (error) {
    console.log(error);
  }
}

const UpdateToken = async (req, res, next) => {
  let body = req.body;
  let id = req.params.id;
  try {
    let ChangeStatus = await Model.updateMaster(`tbl_user_web`, id, body);
    if (ChangeStatus) {
      endConnection();
      res.send(result)
      res.status(200)
    }
  } catch (error) {
    res.status(500)
    console.log(chalk.red(error));
    next(error)
  }
}

const logOutAdminUser = async (req, res, next) => {
  try {
    const checkLogin = await checkUserLogIn(req.headers.authorization)
    if (checkLogin == false) {
      res.status(404);
      res.send('no user login found');
    }
    const user = await Model.getAllData(
      `*`, `tbl_user_web`, `login_token='${req.headers.authorization}' and status =1`, 1, 1
    )
    if (user.length) {
      let ChangeStatus = await Model.updateMaster(`tbl_user_web`, user[0].id, { login_status: 0, login_token: null, login_count: parseInt(user[0].login_count) + 1 });
      if (ChangeStatus) {
        res.status(200)
        res.send(true);
      }
    }
  } catch (error) {
    res.status(500)
    console.log(chalk.red(error));
    next(error)
  }
}

const LoginAdmin = async (req, res, next) => {
  try {
    let body = req.body;
    let result = await Model.getAllData(
      `id,username,mobile,alternate_mobile,email_id,profile_dp,userType,address,login_status,token,login_count`,
      `tbl_user_web`,
      `email_id='${body.email_id}' and password = '${body.password}' and status = 1 and userType = 1`,
      1,
      1
    );
    if (result.length) {
      let loginToken = await randomString(10, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      if (parseInt(result[0].login_count <= 3)) {
        res.status(400);
        res.send('maximum user logged in');
      }
      let ChangeStatus = await Model.updateMaster(`tbl_user_web`, result[0].id, { login_status: 1, login_token: loginToken, login_count: parseInt(result[0].login_count) + 1 });
      if (ChangeStatus) {
        endConnection();
        result[0].login_token = loginToken;
        res.send(result);
        res.status(200);
      }
    } else {
      res.send(false)
      res.status(302)
    }
  } catch (error) {
    res.status(500)
    console.log(chalk.red(error));
    next(error)
  }
}



const DownloadImage = async (req, res, next) => {
  let body = req.params.filename;
  try {
    let uploadPath = __dirname + '/Images/' + `${body}`;
    res.sendFile(uploadPath)
  } catch (error) {
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
}


const Check_Db = async (req, res, next) => {
  try {
    const checkemail = await Model.getAllData(
      `*`,
      `tbl_user_web`,
      1,
      1,
      1
    )
    res.send(checkemail)
  } catch (error) {
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
}


const addMaster = async (req, res, next) => {
  const tableName = req.params.tableName;
  const id = req.params.id;
  const body = req.body;
  try {
    const GetUserDeatils = await Model.getAllData(
      `*`,
      `tbl_user_web`,
      `id=${body.user_id}`,
      1,
      1
    )
    if (GetUserDeatils) {
      let wallet = GetUserDeatils[0].wallet == null ? 0 : GetUserDeatils[0].wallet;
      if (body.debited_credited == "credited") {
        wallet = parseInt(wallet) + parseInt(body.amount)
        body.reason = 'recharge';
      } else {
        wallet = parseInt(wallet) - parseInt(body.amount)
        body.reason = 'penalty / wrong payment'
      }
      const result = await Model.updateMaster(
        `tbl_user_web`,
        req.body.user_id,
        { wallet: wallet },
        columname = "id"
      );
      if (result) {
        const result1 = await Model.addMaster(tableName, body);
        if (result1) {
          const GetUserDeatils1 = await Model.getAllData(
            `*`,
            `tbl_user_web`,
            `id=${body.user_id}`,
            1,
            1
          );
          if (GetUserDeatils1) {
            res.send(GetUserDeatils1);
            res.status(200);
          }
        }
      }
    }
    endConnection();
  } catch (error) {
    endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
};

const UpdateBiddingTrip = async (req, res, next) => {
  let id = req.params.id;
  let vendor_id = req.params.vendor_id;
  let body = req.body;
  try {
    let ChangeStatus = await Model.updateMaster(`tbl_bidding_trips`, id, body);
    if (ChangeStatus) {
      let result = await NewTrips(vendor_id);
      if (result) {
        res.send(result)
        res.status(200)
      }
    }
  } catch (error) {
    endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
}

const AddBidTrips = async (req, res, next) => {
  let vend = req.params.vendor_id;
  try {
    let addData = await Model.addMaster(`tbl_bidding_trips`, req.body)
    if (addData) {
      let result = await NewTrips(vend);
      if (result.length) {
        res.send(result)
        res.status(200)
      }
    }
  } catch (error) {
    endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
}

const AddUser = async (req, res, next) => {
  const tableName = `tbl_user_web`;
  const body = req.body;
  try {
    const data = await UploadImage(req.files)
    if (data !== undefined) {
      body.profile_dp = data;
    } else {
      body.profile_dp = null;
    }
    const checkemail = await Model.getAllData(
      `email_id,mobile`,
      `${tableName}`,
      `email_id = '${body.email_id}' or mobile = '${body.mobile}' and status = 1`,
      1,
      1
    )
    if (checkemail.length) {
      let data = false;
      res.send(data)
    } else {
      const result = await Model.addMaster(tableName, body);
      if (result) {
        endConnection();
        result.profile_pic = data;
        res.send(result);
      }
    }
  } catch (error) {
    endConnection();
    console.log(chalk.red(error));
    next(error);
    res.status(500)
  }
}

const AppDocumentUpload = async (req, res, next) => {
  const body = req.body;
  try {
    let CheckDoc = await Model.getAllData(
      `*`,
      `tbl_vendar_documents`,
      `userid=${body.userid}`,
      1,
      1
    );
    if (req.files.aadhar_front !== undefined) {
      body.aadhar_front = await UploadDocument1(req.files.aadhar_front, body.userid, req.body.aadhar_front == 'null' ? false : true, req.body.aadhar_front ? req.body.aadhar_front : null);
    } else if (req.files.aadhar_back !== undefined) {
      body.aadhar_back = await UploadDocument1(req.files.aadhar_back, body.userid, req.body.aadhar_back == 'null' ? false : true, req.body.aadhar_back ? req.body.aadhar_back : null);
    } else if (req.files.driving_licence_front !== undefined) {
      body.driving_licence_front = await UploadDocument1(req.files.driving_licence_front, body.userid, req.body.driving_licence_front == 'null' ? false : true, req.body.driving_licence_front ? req.body.driving_licence_front : null);
    } else if (req.files.driving_licence_back !== undefined) {
      body.driving_licence_back = await UploadDocument1(req.files.driving_licence_back, body.userid, req.body.driving_licence_back == 'null' ? false : true, req.body.driving_licence_back ? req.body.driving_licence_back : null);
    } else if (req.files.pancard_front !== undefined) {
      body.pancard_front = await UploadDocument1(req.files.pancard_front, body.userid, req.body.pancard_front == 'null' ? false : true, req.body.pancard_front ? req.body.pancard_front : null);
    } else if (req.files.pancard_back !== undefined) {
      body.pancard_back = await UploadDocument1(req.files.pancard_back, body.userid, req.body.pancard_back == 'null' ? false : true, req.body.pancard_back ? req.body.pancard_back : null);
    } else if (req.files.account_details !== undefined) {
      body.account_details = await UploadDocument1(req.files.account_details, body.userid, req.body.account_details == 'null' ? false : true, req.body.account_details ? req.body.account_details : null)
    }

    if (CheckDoc.length) {
      const result = await Model.updateMaster(
        `tbl_vendar_documents`,
        CheckDoc[0].id,
        body,
        columname = "id"
      );
      if (result) {
        let CheckDoc1 = await Model.getAllData(
          `*`,
          `tbl_vendar_documents`,
          `userid=${body.userid}`,
          1,
          1
        );
        if (CheckDoc1) {
          res.status(200);
          res.send(CheckDoc1);
        }
      }
    } else {
      const result = await Model.addMaster(`tbl_vendar_documents`, body);
      if (result) {
        let CheckDoc1 = await Model.getAllData(
          `*`,
          `tbl_vendar_documents`,
          `userid=${body.userid}`,
          1,
          1
        );
        if (CheckDoc1) {
          res.status(200);
          res.send(CheckDoc1);
        }
      }

    }
  } catch (error) {
    endConnection();
    console.log(chalk.red(error));
    next(error);
    res.status(500)
  }
}

const AddVendarDocument = async (req, res, next) => {

  const tableName = req.params.tableName;
  const body = req.body;
  const Files = req.files;
  try {
    if (Files[body.driving_licence_front] == null) {
      body.driving_licence_front = null;
    } else {
      Files[body.driving_licence_front] = { file: Files[body.driving_licence_front] }
      body.driving_licence_front = await UploadDocument(Files[body.driving_licence_front], body.userid);
      if (body.driving_licence_front == undefined) {
        body.driving_licence_front = null
      }
    }
    if (Files[body.driving_licence_back] == null) {
      body.driving_licence_back = null;
    } else {
      Files[body.driving_licence_back] = { file: Files[body.driving_licence_back] }
      body.driving_licence_back = await UploadDocument(Files[body.driving_licence_back], body.userid);
      if (body.driving_licence_back === undefined) {
        body.driving_licence_back = null;
      }
    }

    if (Files[body.aadhar_front] == null) {
      body.aadhar_front = null;
    } else {
      Files[body.aadhar_front] = { file: Files[body.aadhar_front] }
      body.aadhar_front = await UploadDocument(Files[body.aadhar_front], body.userid);
      if (body.aadhar_front === undefined) {
        body.aadhar_front = null;
      }
    }

    if (Files[body.aadhar_back] == null) {
      body.aadhar_back = null;
    } else {
      Files[body.aadhar_back] = { file: Files[body.aadhar_back] }
      body.aadhar_back = await UploadDocument(Files[body.aadhar_back], body.userid);
      if (body.aadhar_back == undefined) {
        body.aadhar_back = null
      }
    }

    if (Files[body.pancard_front] == null) {
      body.pancard_front = null;
    } else {
      Files[body.pancard_front] = { file: Files[body.pancard_front] }
      body.pancard_front = await UploadDocument(Files[body.pancard_front], body.userid);
      if (body.pancard_front == undefined) {
        body.pancard_front = null
      }
    }

    if (Files[body.pancard_back] == null) {
      body.pancard_back = null;
    } else {
      Files[body.pancard_back] = { file: Files[body.pancard_back] }
      body.pancard_back = await UploadDocument(Files[body.pancard_back], body.userid);

      if (body.pancard_back == undefined) {
        body.pancard_back = null
      }
    }
    const result = await Model.addMaster(`tbl_vendar_documents`, body);
    if (result) {
      result.body = body;
      res.send(result);
    }
    endConnection();
  } catch (error) {
    endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
}

const TripsData = async (req, res, next) => {
  try {
    let result = await Model.getAllData(
      `tbl_trips.*,tbl_user_web.username as customer_name,tbl_city.city as pickuplocation_name,new_city.city as drop_location_name`,
      `tbl_trips,tbl_user_web,tbl_city,tbl_city as new_city`,
      `tbl_user_web.id = tbl_trips.customer_id and tbl_trips.pickup_location=tbl_city.id and tbl_trips.drop_location = new_city.id`,
      1,
      `tbl_trips.id DESC`
    );
    if (result) {
      endConnection();
      res.send(result);
    }
  } catch (error) {
    endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
};

const checkUserLogIn = async (login_token) => {
  const result = await Model.getAllData(
    `*`, `tbl_user_web`, `login_token = '${login_token}' and status = 1`, 1, 1
  );
  if (result.length) {
    return true
  } else {
    return false
  }
}

const getFreedomWithLoginCheck = async (req, res, next) => {
  let body = req.body.value ? req.body.value : req.body;
  try {
    const checkLogin = await checkUserLogIn(req.headers.authorization);
    if (checkLogin == false) {
      res.send('no user login found');
      res.status(404);
    }
    var result = [];
    result = await Model.getAllData(
      body.select,
      body.tableName,
      body.condition,
      body.groupby,
      body.orderby
    );
    if (result) {
      endConnection();
      res.send(result);
    }
  } catch (error) {
    endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
};

const getFreedom = async (req, res, next) => {
  let body = req.body.value ? req.body.value : req.body;
  try {
    var result = [];
    result = await Model.getAllData(
      body.select,
      body.tableName,
      body.condition,
      body.groupby,
      body.orderby
    );
    if (result) {
      endConnection();
      res.send(result);
    }
  } catch (error) {
    endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
};


const randomString = async (length, chars) => {
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

const SendNotifyToUser = async (pickup_location, drop_location) => {
  try {
    let UserData = await Model.getAllData(
      `token,travel_location`,
      `tbl_user_web`,
      `userType = 3 and status = 1 and token IS NOT NULL`,
      1,
      1
    );
    let locationCheck = await Model.getAllData(
      `tbl_city.state_id as pick_state,DropCity.state_id as drop_state`,
      `tbl_city,tbl_city as DropCity`,
      `tbl_city.id = ${pickup_location} and DropCity.id =${drop_location}`,
      1,
      1
    )
    if (UserData && locationCheck.length) {
      let wait = await UserData.map(async (ival, i) => {
        let LocationData = ival.travel_location !== null ? JSON.parse(ival.travel_location) : []

        if (LocationData.length) {
          LocationData.map((jval, j) => {

            if (jval == locationCheck[0].pick_state && jval == locationCheck[0].drop_state) {
              admin.messaging().send({
                token: ival.token,
                data: {
                  customData: "Igotaxy",
                  id: '1',
                  ad: "Your Profile Approved",
                  subTitle: "Notify Sub",
                  routes: "NewTrips"
                },
                android: {
                  notification: {
                    body: "New Trip has been added😊.",
                    title: "New Trip Arrived",
                    color: "#FFF566",
                    priority: "high",
                    sound: "default",
                    vibrateTimingsMillis: [200, 500, 800],
                    imageUrl: "https://images.unsplash.com/photo-1556122071-e404eaedb77f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=719&q=80"
                  }
                }
              }).then((msg) => {

                if (i + 1 == UserData.length) {
                  return true
                }
              }).catch((err) => {
                console.log(err);
              })

              if (i + 1 == UserData.length) {
                console.log("Hello");
                return true
              }
            }
          })
        }
      })
      await Promise(wait);
    }

  } catch (error) {
    console.log(error);
  }
}


// SendNotifyToUser(1024,1029)

const StartandEndTrip = async (req, res, next) => {
  let id = req.params.id;
  let body = req.body;
  try {
    let UpdateActive = await Model.updateMaster(
      `tbl_active_trips`,
      id,
      body
    )
    if (UpdateActive) {
      let result12 = []
      let result = await Model.getAllData(
        `start,end,trip_id,vendor_id`,
        `tbl_active_trips`,
        `id = ${id}`,
        1,
        1
      )
      if (result.length) {
        if (result[0].end == 1) {
          let ChangeTripStatus = await Model.updateMaster(
            `tbl_trips`,
            result[0].trip_id,
            { trip_status: "completed" }
          )
          let ChangeTripStatus1 = await Model.updateMaster(
            `tbl_active_trips`,
            result[0].trip_id,
            { status: "completed" },
            "trip_id"
          )

          if (ChangeTripStatus && ChangeTripStatus1) {
            let ActiveTrips23 = await Model.getAllData(
              `tbl_active_trips.*,tbl_trips.trip_id as T_trip,tbl_trips.trip_type,tbl_city.city as pickup_location,DropCity.city as droplocation,
                  tbl_trips.pickup_date,tbl_trips.drop_date,tbl_trips.cab_type,tbl_trips.trip_kms,tbl_trips.trip_charges,tbl_trips.extra_charge,
                  tbl_user_web.username as customername,tbl_user_web.mobile as customerMobile,tbl_user_web.address`,

              `tbl_active_trips,tbl_trips,tbl_city,tbl_city as DropCity,tbl_user_web`,

              `tbl_active_trips.vendor_id=${result[0].vendor_id} and tbl_active_trips.end = 0 and tbl_active_trips.status='completed' and tbl_user_web.id = tbl_trips.customer_id  and tbl_active_trips.trip_id = tbl_trips.id and tbl_city.id = tbl_trips.pickup_location and
                  DropCity.id = tbl_trips.drop_location `,
              1,
              `tbl_active_trips.id`
            )
            if (ActiveTrips23) {
              res.send(ActiveTrips23)
              res.status(200)
            }
          } else {
            res.send(false)
            res.status(400)
          }
        } else {
          res.send(true)
          res.status(200)
        }
      } else {
        res.send(false)
        res.status(400)
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500)
    res.send(error)
  }
}


const AddTrips = async (req, res, next) => {
  const newcustomer = req.params.newcustomer;
  let body = req.body;
  try {
    if (newcustomer == 0) {
      body.trip_id = await randomString(10, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      const result = await Model.addMaster(`tbl_trips`, body);

      if (result) {
        let getData = await Model.getAllData(`*`, `tbl_trips`, `id=${result.insertId}`, 1, 1)
        if (getData) {
          let SendNotifyToUser1 = await SendNotifyToUser(body.pickup_location, body.drop_location);
          if (getData) {
            res.send(getData)
            res.status(200);
          }
        }
      }
    } else if (newcustomer == 1) {
      let customer1 = JSON.parse(body.customer);
      let customer = customer1[0]
      customer.status = 1;
      customer.userType = 4;
      let AddNewCustomer = await Model.addMaster(`tbl_user_web`, customer);

      if (AddNewCustomer) {
        delete body.customer;
        body.customer_id = AddNewCustomer.insertId;
        body.trip_id = await randomString(10, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ');
        const result1 = await Model.addMaster(`tbl_trips`, body);

        if (result1) {
          let getData1 = await Model.getAllData(`*`, `tbl_trips`, `id=${result1.insertId}`, 1, 1);
          let SendNotifyToUser1 = await SendNotifyToUser(body.pickup_location, body.drop_location);

          if (getData1) {
            res.send(getData1)
            res.status(200);
          }
        }
      }
    }
  } catch (error) {
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
};

const RefreshApp = async () => {

}

const getbeforedateandtimeFunction = async (Trips) => {
  let arr = []
  if (Trips.length > 0) {
    Trips.map(async (ival, i) => {
      let Split_it = ival.pickup_date.split(" ");
      let Split_date = Split_it[0].split("-");
      let Split_time = Split_it[1].split(":");
      let fullDate = `${Split_date[0]}/${parseInt(Split_date[1]) + 1}/${Split_date[2]} ${Split_time[0]}:${Split_time[1]}`;
      let check = new Date(fullDate);
      var hourago = new Date(check.getTime() - (1000 * 60 * 60));
      let CurrentDate = new Date();
      let timed = await formatAMPM(hourago);

      ival.Will_visibleAt = `${hourago.getDate() > 9 ? hourago.getDate() : `0${hourago.getDate()}`}-${hourago.getMonth() > 9 ? hourago.getMonth() : `0${hourago.getMonth()}`}-${hourago.getFullYear()} at ${timed}`

      if (
        CurrentDate.getFullYear() == hourago.getFullYear() &&
        CurrentDate.getMonth() + 1 == hourago.getMonth() &&
        CurrentDate.getDate() >= hourago.getDate()

      ) {

        if (CurrentDate.getDate() == hourago.getDate() && CurrentDate.getHours() >= hourago.getHours()) {
          ival.beforehour = true;
        } else {
          ival.beforehour = true;
        }

      } else {

        ival.beforehour = false;
      }
      let timeDiff = hourago.getTime() - CurrentDate.getTime()

      ival.Count_down = Math.floor(parseInt(timeDiff) / 10000);

      arr.push(ival);
    })
    return arr;
  }
}


const BackGroundRefreshApp = async (req, res, next) => {

  let id = req.params.id;
  let token = req.params.token;
  try {

    let result = await Model.getAllData(
      `*`,
      `tbl_user_web`,
      `id=${id} and login_token='${token}'`,
      1,
      1
    );
    if (result.length) {

      let StateData = await Model.getAllData(
        `id as value ,state as label`,
        `tbl_state`,
        `status=1`,
        1,
        1
      )
      if (StateData) {
        result[0].state = JSON.stringify(StateData)
      } else {
        result[0].state = JSON.stringify([])
      }
      let BiddingTrip = await Model.getAllData(
        `*`,
        `tbl_bidding_trips`,
        `vendor_id = ${result[0].id} and status = 'approved'`,
        1,
        `id DESC`
      );

      let tbl_announcement = await Model.getAllData(
        `*`,
        `tbl_announcement`,
        `status = 1`,
        1,
        `id DESC`
      )

      if (tbl_announcement) {
        result[0].announcement = JSON.stringify(tbl_announcement)

      } else {
        result[0].announcement = JSON.stringify([])
      }
      if (BiddingTrip) {

        let dddd = []
        let waittt1 = await BiddingTrip.map(async (ival, i) => {
          ival.activeindicator = false
          ival.activeindicator1 = false;
          let Split_it = ival.pickUp_date.split(" ");

          let Split_date = Split_it[0].split("-");

          let Split_time = Split_it[1].split(":");

          let fullDate = `${Split_date[0]}/${parseInt(Split_date[1]) + 1}/${Split_date[2]} ${Split_time[0]}:${Split_time[1]}`;

          let hourago = new Date(fullDate);

          let time = await formatAMPM(hourago)

          ival.new_pickup_date = `${hourago.getDate() > 9 ? hourago.getDate() : `0${hourago.getDate()}`}-${hourago.getMonth() > 9 ? hourago.getMonth() : `0${hourago.getMonth()}`}-${hourago.getFullYear()} at ${time}`

          dddd.push(ival)
        })
        await Promise.all(waittt1)
        result[0].BiddingTrip = JSON.stringify(dddd);
      } else {
        result[0].BiddingTrip = JSON.stringify([]);
      }

      let ActiveTrips = await Model.getAllData(
        `tbl_active_trips.*,tbl_trips.trip_type,tbl_trips.trip_id as Id_trip,tbl_trips.trip_type,tbl_city.city as pickup_location,DropCity.city as droplocation,
    tbl_trips.pickup_date,tbl_trips.drop_date,tbl_trips.cab_type,tbl_trips.trip_kms,tbl_trips.trip_charges,tbl_trips.extra_charge,
    tbl_user_web.username as customername,tbl_user_web.mobile as customerMobile,tbl_user_web.address`,

        `tbl_active_trips,tbl_trips,tbl_city,tbl_city as DropCity,tbl_user_web`,

        `tbl_active_trips.vendor_id=${result[0].id} and tbl_active_trips.end = 0 and tbl_user_web.id = tbl_trips.customer_id  and tbl_active_trips.trip_id = tbl_trips.id and tbl_city.id = tbl_trips.pickup_location and
    DropCity.id = tbl_trips.drop_location `,
        1,
        `tbl_active_trips.id`
      );

      if (ActiveTrips.length) {
        let ddd = [];

        let waittt1 = await ActiveTrips.map(async (ival, i) => {
          console.log(ival);
          ival.activeindicator = false;
          ival.activeindicator1 = false;
          let Split_it = ival.pick_up_date.split(" ");

          let Split_date = Split_it[0].split("-");

          let Split_time = Split_it[1].split(":");

          let fullDate = `${Split_date[0]}/${parseInt(Split_date[1]) + 1}/${Split_date[2]} ${Split_time[0]}:${Split_time[1]}`;

          let hourago = new Date(fullDate);

          let time = await formatAMPM(hourago)

          ival.new_pickup_date = `${hourago.getDate() > 9 ? hourago.getDate() : `0${hourago.getDate()}`}-${hourago.getMonth() > 9 ? hourago.getMonth() : `0${hourago.getMonth()}`}-${hourago.getFullYear()} at ${time}`

          if (ival.trip_type == 'Round Trip') {

            let Split_it1 = ival.drop_date.split(" ");

            let Split_date1 = Split_it1[0].split("-");

            let Split_time1 = Split_it1[1].split(":");

            let fullDate1 = `${Split_date1[0]}/${parseInt(Split_date1[1]) + 1}/${Split_date1[2]} ${Split_time1[0]}:${Split_time1[1]}`;

            let hourago1 = new Date(fullDate1);

            let time1 = await formatAMPM(hourago1)

            ival.new_drop_date = `${hourago1.getDate() > 9 ? hourago1.getDate() : `0${hourago1.getDate()}`}-${hourago1.getMonth() > 9 ? hourago1.getMonth() : `0${hourago1.getMonth()}`}-${hourago1.getFullYear()} at ${time1}`

          }

          ddd.push(ival);
        })
        await Promise.all(waittt1)
        let GetAct = await getbeforedateandtimeFunction(ActiveTrips)
        result[0].ActiveTrips = JSON.stringify(GetAct)
      } else {
        result[0].ActiveTrips = JSON.stringify([])
      }

      let ActiveTrips1 = await Model.getAllData(
        `tbl_active_trips.*,tbl_trips.trip_id as Id_trip,tbl_trips.trip_type,tbl_city.city as pickup_location,DropCity.city as droplocation,
      tbl_trips.pickup_date,tbl_trips.drop_date,tbl_trips.cab_type,tbl_trips.trip_kms,tbl_trips.trip_charges,tbl_trips.extra_charge,
      tbl_user_web.username as customername,tbl_user_web.mobile as customerMobile,tbl_user_web.address`,

        `tbl_active_trips,tbl_trips,tbl_city,tbl_city as DropCity,tbl_user_web`,

        `tbl_active_trips.vendor_id=${result[0].id} and tbl_active_trips.end = 1 and tbl_user_web.id = tbl_trips.customer_id  and tbl_active_trips.trip_id = tbl_trips.id and tbl_city.id = tbl_trips.pickup_location and
      DropCity.id = tbl_trips.drop_location `,
        1,
        `tbl_active_trips.id`
      )

      if (ActiveTrips) {
        result[0].TripHistory = JSON.stringify(ActiveTrips1)
      } else {
        result[0].TripHistory = JSON.stringify([])
      }

      let vendorDrivers = await Model.getAllData(
        `*`,
        `tbl_vendor_drivers`,
        `vendor=${result[0].id}`,
        1,
        `id`
      )

      if (vendorDrivers) {
        result[0].vendorDrivers = JSON.stringify(vendorDrivers)
      } else {
        result[0].vendorDrivers = JSON.stringify([])
      }

      let vendorCabs = await Model.getAllData(
        `*`,
        `tbl_vendor_cabs`,
        `vendor=${result[0].id}`,
        1,
        `id`
      )

      if (vendorCabs) {
        result[0].vendorCabs = JSON.stringify(vendorCabs)
      } else {
        result[0].vendorCabs = JSON.stringify([])
      }

      let WalletHistory = await Model.getAllData(
        `tbl_wallet_master_history.*`,
        `tbl_user_web,tbl_wallet_master_history`,
        `tbl_user_web.id = ${result[0].id} and tbl_wallet_master_history.user_id = tbl_user_web.id`,
        `1`,
        `tbl_wallet_master_history.id DESC`
      )

      let tbl_vendar_documents = await Model.getAllData(
        `*`,
        `tbl_vendar_documents`,
        `userid=${result[0].id}`,
        1,
        1
      )
      if (tbl_vendar_documents) {
        result[0].Documentation = JSON.stringify(tbl_vendar_documents)
      } else {
        result[0].Documentation = null
      }
      if (WalletHistory) {
        let arr = []
        let wait = await WalletHistory.map((ival, i) => {
          arr.push([i + 1, ival.amount, ival.debited_credited, ival.reason, ival.created_At])
        })
        await Promise.all(wait);
        result[0].wallethistory = JSON.stringify(arr);
        res.send(result);
        res.status(200);
      } else {
        result[0].wallethistory = null;
        res.send(result);
        res.status(200);
      }
    } else {
      res.send(false);
      res.status(404)
    }
  } catch (error) {
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
};



const AppLogin = async (req, res, next) => {

  const body = req.body;

  try {
    let result = await Model.getAllData(
      `*`,
      `tbl_user_web`,
      `email_id ='${body.email_id}' and password ='${body.password}' and status = 1 and userType = 3`,
      1,
      1
    );
    if (result.length) {
      let login_token = await randomString(10, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ');

      let UpdateToken = await Model.updateMaster(
        `tbl_user_web`,
        result[0].id,
        { login_token: login_token, login_status: 1 },
        "id"
      )
      if (UpdateToken) {
        result[0].login_token = login_token
      }
      let StateData = await Model.getAllData(
        `id as value ,state as label`,
        `tbl_state`,
        `status=1`,
        1,
        1
      )
      if (StateData) {
        result[0].state = JSON.stringify(StateData)
      } else {
        result[0].state = JSON.stringify([])
      }
      let vendorDrivers = await Model.getAllData(
        `*`,
        `tbl_vendor_drivers`,
        `vendor=${result[0].id}`,
        1,
        `id`
      )

      if (vendorDrivers) {
        result[0].vendorDrivers = JSON.stringify(vendorDrivers)
      } else {
        result[0].vendorDrivers = JSON.stringify([])
      }

      let vendorCabs = await Model.getAllData(
        `*`,
        `tbl_vendor_cabs`,
        `vendor=${result[0].id}`,
        1,
        `id`
      )

      if (vendorCabs) {
        result[0].vendorCabs = JSON.stringify(vendorCabs)
      } else {
        result[0].vendorCabs = JSON.stringify([])
      }

      let tbl_announcement = await Model.getAllData(
        `*`,
        `tbl_announcement`,
        `status = 1`,
        1,
        `id DESC`
      )
      if (tbl_announcement.length) {
        result[0].announcement = JSON.stringify(tbl_announcement)

      } else {
        result[0].announcement = JSON.stringify([])
      }


      let ActiveTrips = await Model.getAllData(
        `tbl_active_trips.*,tbl_trips.trip_id as T_trip,tbl_trips.trip_type,tbl_city.city as pickup_location,DropCity.city as droplocation,
          tbl_trips.pickup_date,tbl_trips.drop_date,tbl_trips.cab_type,tbl_trips.trip_kms,tbl_trips.trip_charges,tbl_trips.extra_charge,
          tbl_user_web.username as customername,tbl_user_web.mobile as customerMobile,tbl_user_web.address`,

        `tbl_active_trips,tbl_trips,tbl_city,tbl_city as DropCity,tbl_user_web`,

        `tbl_active_trips.vendor_id=${result[0].id} and tbl_active_trips.end = 0  and tbl_user_web.id = tbl_trips.customer_id  and tbl_active_trips.trip_id = tbl_trips.id and tbl_city.id = tbl_trips.pickup_location and
          DropCity.id = tbl_trips.drop_location `,
        1,
        `tbl_active_trips.id`
      )

      if (ActiveTrips.length > 0) {

        let ddd = [];


        let waittt1 = await ActiveTrips.map(async (ival, i) => {
          ival.activeindicator = false;
          ival.activeindicator1 = false;

          let Split_it = ival.pick_up_date.split(" ");

          let Split_date = Split_it[0].split("-");

          let Split_time = Split_it[1].split(":");

          let fullDate = `${Split_date[0]}/${parseInt(Split_date[1]) + 1}/${Split_date[2]} ${Split_time[0]}:${Split_time[1]}`;

          let hourago = new Date(fullDate);

          let time = await formatAMPM(hourago)

          ival.new_pickup_date = `${hourago.getDate() > 9 ? hourago.getDate() : `0${hourago.getDate()}`}-${hourago.getMonth() > 9 ? hourago.getMonth() : `0${hourago.getMonth()}`}-${hourago.getFullYear()} at ${time}`

          if (ival.trip_type == 'Round Trip') {

            // drop_date

            let Split_it1 = ival.drop_date.split(" ");

            let Split_date1 = Split_it1[0].split("-");

            let Split_time1 = Split_it1[1].split(":");

            let fullDate1 = `${Split_date1[0]}/${parseInt(Split_date1[1]) + 1}/${Split_date1[2]} ${Split_time1[0]}:${Split_time1[1]}`;

            let hourago1 = new Date(fullDate1);

            let time1 = await formatAMPM(hourago1)

            ival.new_drop_date = `${hourago1.getDate() > 9 ? hourago1.getDate() : `0${hourago1.getDate()}`}-${hourago1.getMonth() > 9 ? hourago1.getMonth() : `0${hourago1.getMonth()}`}-${hourago1.getFullYear()} at ${time1}`

          }

          ddd.push(ival);
        });

        await Promise.all(waittt1);

        let GetAct = await getbeforedateandtimeFunction(ActiveTrips)
        result[0].ActiveTrips = JSON.stringify(GetAct);
      } else {
        result[0].ActiveTrips = JSON.stringify([])
      }

      let ActiveTrips1 = await Model.getAllData(
        `tbl_active_trips.*,tbl_trips.trip_id as Id_trip,tbl_trips.trip_type,tbl_city.city as pickup_location,DropCity.city as droplocation,
          tbl_trips.pickup_date,tbl_trips.drop_date,tbl_trips.cab_type,tbl_trips.trip_kms,tbl_trips.trip_charges,tbl_trips.extra_charge,
          tbl_user_web.username as customername,tbl_user_web.mobile as customerMobile,tbl_user_web.address`,

        `tbl_active_trips,tbl_trips,tbl_city,tbl_city as DropCity,tbl_user_web`,

        `tbl_active_trips.vendor_id=${result[0].id} and tbl_active_trips.status = "completed" and tbl_user_web.id = tbl_trips.customer_id  and tbl_active_trips.trip_id = tbl_trips.id and tbl_city.id = tbl_trips.pickup_location and
          DropCity.id = tbl_trips.drop_location `,
        1,
        `tbl_active_trips.id Desc`
      )

      if (ActiveTrips) {
        result[0].TripHistory = JSON.stringify(ActiveTrips1)
      } else {
        result[0].TripHistory = JSON.stringify([])
      }

      let WalletHistory = await Model.getAllData(
        `tbl_wallet_master_history.*`,
        `tbl_user_web,tbl_wallet_master_history`,
        `tbl_wallet_master_history.user_id = tbl_user_web.id and tbl_wallet_master_history.user_id=${result[0].id}`,
        1,
        1
      );

      let tbl_vendar_documents = await Model.getAllData(
        `*`,
        `tbl_vendar_documents`,
        `userid=${result[0].id}`,
        1,
        1
      )
      if (tbl_vendar_documents) {
        result[0].Documentation = JSON.stringify(tbl_vendar_documents)
      } else {
        result[0].Documentation = null
      }

      let BiddingTrip = await Model.getAllData(
        `*`,
        `tbl_bidding_trips`,
        `vendor_id = ${result[0].id}`,
        1,
        `id DESC`
      )

      if (BiddingTrip.length > 0) {

        let dddd = [];
        let waittt1 = await BiddingTrip.map(async (ival, i) => {
          ival.activeindicator = false;
          ival.activeindicator1 = false;
          let Split_it = ival.pickUp_date.split(" ");

          let Split_date = Split_it[0].split("-");

          let Split_time = Split_it[1].split(":");

          let fullDate = `${Split_date[0]}/${parseInt(Split_date[1]) + 1}/${Split_date[2]} ${Split_time[0]}:${Split_time[1]}`;

          let hourago = new Date(fullDate);

          let time = await formatAMPM(hourago)

          ival.new_pickup_date = `${hourago.getDate() > 9 ? hourago.getDate() : `0${hourago.getDate()}`}-${hourago.getMonth() > 9 ? hourago.getMonth() : `0${hourago.getMonth()}`}-${hourago.getFullYear()} at ${time}`

          dddd.push(ival)
        })
        await Promise.all(waittt1)
        result[0].BiddingTrip = JSON.stringify(dddd);
        // result[0].BiddingTrip  = JSON.stringify(BiddingTrip)
      } else {
        result[0].BiddingTrip = JSON.stringify([])
      }

      if (WalletHistory) {

        let arr = []

        let wait = await WalletHistory.map((ival, i) => {

          arr.push([i + 1, ival.amount, ival.debited_credited, ival.reason, ival.created_At])

        })


        await Promise.all(wait);

        result[0].wallethistory = JSON.stringify(arr);

        res.status(200);
        res.send(result)
      } else {

        result[0].wallethistory = null;
        // console.log(result);

        res.send(result);
        res.status(200);

      }
    } else {
      res.status = 404;
      res.send(false);
    }
  } catch (error) {
    //db end connection
    // endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
};



const UpdateBiddingApproval = async (req, res, next) => {
  const tableName = req.params.tableName;
  const body = req.body.categoryArray;
  const id = req.body.id;
  let columname = req.params.id;

  console.log(req.params);
  console.log(req.body);
  try {

    const FetchData = await Model.getAllData(
      `id`,
      `tbl_bidding_trips`,
      `trip_id = ${req.params.vend_id}`,
      1,
      1
    )
    if (FetchData) {
      console.log(FetchData, "1157");

      let wait = await FetchData.map(async (ival, i) => {

        if (ival.id == id) {
          let result1 = await Model.updateMaster(
            tableName,
            id,
            body
          );
        } else {
          let result2 = await Model.updateMaster(
            tableName,
            ival.id,
            { status: 'waiting' }
          );
        }

        if (i + 1 == FetchData.length) {
          let result11 = await Model.getAllData(
            `tbl_bidding_trips.*,tbl_user_web.username as UserName,tbl_user_web.token,tbl_trips.trip_assigned_to,tbl_user_web.wallet as userwallet,tbl_user_web.id as VendorId`,
            `tbl_bidding_trips,tbl_user_web,tbl_trips`,
            `tbl_bidding_trips.vendor_id = tbl_user_web.id and  tbl_trips.id = tbl_bidding_trips.trip_id  and tbl_bidding_trips.trip_id = ${req.params.vend_id}`,
            1,
            `tbl_bidding_trips.req_amount `
          )
          if (result11) {
            res.send(result11);
            res.status(200)
          }
        }

      })

      await Promise.all(wait)

    }

  } catch (error) {
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
}

const updateMasterApp = async (req, res, next) => {
  const tableName = req.params.tableName;
  const body = req.body;
  // const id = req.body.id;
  let id = req.params.id;
  console.log(body);
  try {
    const result1 = await Model.updateMaster(
      tableName,
      id,
      body
    );
    if (result1) {
      console.log(result1, "500");

      let result = await Model.getAllData(
        `*`,
        `${tableName}`,
        `id = ${id}`,
        1,
        1
      )
      if (result) {
        // console.log(res1,"updateMasterApp");
        // res.status(200);
        // res.send(res1);

        let StateData = await Model.getAllData(
          `id,state as name`,
          `tbl_state`,
          `status=1`,
          1,
          1
        )
        if (StateData) {
          result[0].state = JSON.stringify(StateData)
        } else {
          result[0].state = JSON.stringify([])
        }

        let vendorDrivers = await Model.getAllData(
          `*`,
          `tbl_vendor_drivers`,
          `vendor=${result[0].id}`,
          1,
          `id`
        )

        if (vendorDrivers) {
          result[0].vendorDrivers = JSON.stringify(vendorDrivers)
        } else {
          result[0].vendorDrivers = JSON.stringify([])
        }

        let vendorCabs = await Model.getAllData(
          `*`,
          `tbl_vendor_cabs`,
          `vendor=${result[0].id}`,
          1,
          `id`
        )

        if (vendorCabs) {
          result[0].vendorCabs = JSON.stringify(vendorCabs)
        } else {
          result[0].vendorCabs = JSON.stringify([])
        }


        let ActiveTrips = await Model.getAllData(
          `tbl_active_trips.*,tbl_trips.trip_id as T_trip,tbl_trips.trip_type,tbl_city.city as pickup_location,DropCity.city as droplocation,
            tbl_trips.pickup_date,tbl_trips.drop_date,tbl_trips.cab_type,tbl_trips.trip_kms,tbl_trips.trip_charges,tbl_trips.extra_charge,
            tbl_user_web.username as customername,tbl_user_web.mobile as customerMobile,tbl_user_web.address`,

          `tbl_active_trips,tbl_trips,tbl_city,tbl_city as DropCity,tbl_user_web`,

          `tbl_active_trips.vendor_id=${result[0].id} and tbl_user_web.id = tbl_trips.customer_id  and tbl_active_trips.trip_id = tbl_trips.id and tbl_city.id = tbl_trips.pickup_location and
            DropCity.id = tbl_trips.drop_location `,
          1,
          `tbl_active_trips.id`
        )

        if (ActiveTrips) {
          result[0].ActiveTrips = JSON.stringify(ActiveTrips)
        } else {
          result[0].ActiveTrips = JSON.stringify([])
        }


        let BiddingTrip = await Model.getAllData(
          `*`,
          `tbl_bidding_trips`,
          `vendor_id = ${result[0].id}`,
          1,
          `id DESC`
        )

        if (BiddingTrip) {
          result[0].BiddingTrip = JSON.stringify(BiddingTrip)
        } else {
          result[0].BiddingTrip = JSON.stringify([])
        }

        let ActiveTrips1 = await Model.getAllData(
          `tbl_active_trips.*,tbl_trips.trip_id as Id_trip,tbl_trips.trip_type,tbl_city.city as pickup_location,DropCity.city as droplocation,
            tbl_trips.pickup_date,tbl_trips.drop_date,tbl_trips.cab_type,tbl_trips.trip_kms,tbl_trips.trip_charges,tbl_trips.extra_charge,
            tbl_user_web.username as customername,tbl_user_web.mobile as customerMobile,tbl_user_web.address`,

          `tbl_active_trips,tbl_trips,tbl_city,tbl_city as DropCity,tbl_user_web`,

          `tbl_active_trips.vendor_id=${result[0].id} and tbl_active_trips.end = 1 and tbl_user_web.id = tbl_trips.customer_id  and tbl_active_trips.trip_id = tbl_trips.id and tbl_city.id = tbl_trips.pickup_location and
            DropCity.id = tbl_trips.drop_location `,
          1,
          `tbl_active_trips.id`
        )

        if (ActiveTrips) {
          result[0].TripHistory = JSON.stringify(ActiveTrips1)
        } else {
          result[0].TripHistory = JSON.stringify([])
        }


        let WalletHistory = await Model.getAllData(
          `tbl_wallet_master_history.*`,
          `tbl_user_web,tbl_wallet_master_history`,
          `tbl_user_web.id = ${result[0].id} and tbl_wallet_master_history.user_id = tbl_user_web.id`,
          `1`,
          `tbl_wallet_master_history.id DESC`
        )

        let tbl_vendar_documents = await Model.getAllData(
          `*`,
          `tbl_vendar_documents`,
          `userid=${result[0].id}`,
          1,
          1
        )
        if (tbl_vendar_documents) {


          result[0].Documentation = JSON.stringify(tbl_vendar_documents)

        } else {

          result[0].Documentation = null

        }

        if (WalletHistory) {

          let arr = []

          let wait = await WalletHistory.map((ival, i) => {

            arr.push([i + 1, ival.amount, ival.debited_credited, ival.created_At])

          })


          await Promise.all(wait);

          result[0].wallethistory = JSON.stringify(arr);

          //  console.log(result,1353);

          res.send(result);
          res.status(200);
        } else {

          result[0].wallethistory = null;
          // console.log(result);

          res.send(result, "1181");
          res.status(200);

        }

      }


    }
    // db end connection
    // endConnection();
    //res.send(result);
  } catch (error) {
    //db end connection
    // endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
};

const updateMaster = async (req, res, next) => {
  const tableName = req.params.tableName;
  const body = req.body.categoryArray;
  const id = req.body.id;
  let columname = req.params.id;
  console.log(body);
  try {
    const result = await Model.updateMaster(
      tableName,
      id,
      body,
      columname
    );
    if (result) {
      console.log(result, "500");

      let res1 = await Model.getAllData(
        `*`,
        `${tableName}`,
        `id = ${id}`,
        1,
        1
      )
      if (res1) {
        console.log(res1);
        res.status(200);
        res.send(res1);
      }


    }
    // db end connection
    // endConnection();
    //res.send(result);
  } catch (error) {
    //db end connection
    // endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
};



const UpdateUser = async (req, res, next) => {
  // const tableName = `tbl_user_web`;
  // const body = req.body;

  const tableName = req.params.tableName;
  const body = req.body;
  const id = req.params.editid;
  let columname = req.params.id;
  console.log(req.body, "581");

  console.log(req.files, "582");
  try {

    let UpdateOldImage = await Model.getAllData(
      `*`,
      `${tableName}`,
      `id = ${id}`,
      1,
      1
    )
    if (UpdateOldImage) {

      const data = await UploadImage(req.files, true, UpdateOldImage[0].profile_dp)

      console.log(data, "succeess")

      if (data !== undefined) {
        body.profile_dp = data;
      } else {
        body.profile_dp = null;
      }

      console.log(body)

      const result = await Model.updateMaster(
        tableName,
        id,
        body,
        columname
      );
      if (result) {
        console.log(result, "500");

        let res1 = await Model.getAllData(
          `*`,
          `${tableName}`,
          `id = ${id}`,
          1,
          1
        )
        if (res1) {
          console.log(res1);
          res.status(200);
          res.send(res1);
        }


      }
    }
    //res.send("success")
    //  endConnection();

  } catch (error) {
    endConnection();
    console.log(chalk.red(error));
    next(error);
    res.status(500)
  }
}



const UploadUserProfile = async (req, res, next) => {
  const id = req.params.id;
  let tableName = 'tbl_user_web';
  let columname = "id";
  let body = req.body;
  try {
    // console.log(body);
    // console.log(id);



    let UpdateOldImage = await Model.getAllData(
      `*`,
      `${tableName}`,
      `id = ${id}`,
      1,
      1
    )
    if (UpdateOldImage) {

      const data = await UploadImage(req.files, true, UpdateOldImage[0].profile_dp)

      // console.log(data,"succeess")

      if (data !== undefined) {
        body.profile_dp = data;
      } else {
        body.profile_dp = null;
      }

      const result1 = await Model.updateMaster(
        tableName,
        id,
        body,
        columname
      );
      if (result1) {
        // console.log(result,"500");

        let result = await Model.getAllData(
          `*`,
          `${tableName}`,
          `id = ${id}`,
          1,
          1
        )
        if (result) {

          let BiddingTrip = await Model.getAllData(
            `*`,
            `tbl_bidding_trips`,
            `vendor_id = ${result[0].id}`,
            1,
            `id DESC`
          )

          if (BiddingTrip) {
            result[0].BiddingTrip = JSON.stringify(BiddingTrip)
          } else {
            result[0].BiddingTrip = JSON.stringify([])
          }

          let tbl_announcement = await Model.getAllData(
            `*`,
            `tbl_announcement`,
            `status = 1`,
            1,
            `id DESC`
          )

          if (tbl_announcement.length) {
            result[0].announcement = JSON.stringify(tbl_announcement)

          } else {
            result[0].announcement = JSON.stringify([])
          }

          let vendorDrivers = await Model.getAllData(
            `*`,
            `tbl_vendor_drivers`,
            `vendor=${result[0].id}`,
            1,
            `id`
          )

          if (vendorDrivers) {
            result[0].vendorDrivers = JSON.stringify(vendorDrivers)
          } else {
            result[0].vendorDrivers = JSON.stringify([])
          }

          let vendorCabs = await Model.getAllData(
            `*`,
            `tbl_vendor_cabs`,
            `vendor=${result[0].id}`,
            1,
            `id`
          )

          if (vendorCabs) {
            result[0].vendorCabs = JSON.stringify(vendorCabs)
          } else {
            result[0].vendorCabs = JSON.stringify([])
          }


          let ActiveTrips = await Model.getAllData(
            `*`,
            `tbl_active_trips`,
            `vendor_id=${result[0].id}`,
            1,
            `id`
          )

          if (vendorCabs) {
            result[0].ActiveTrips = JSON.stringify(ActiveTrips)
          } else {
            result[0].ActiveTrips = JSON.stringify([])
          }


          let WalletHistory = await Model.getAllData(
            `tbl_wallet_master_history.*`,
            `tbl_user_web,tbl_wallet_master_history`,
            `tbl_user_web.id = ${result[0].id} and tbl_wallet_master_history.user_id = tbl_user_web.id`,
            `1`,
            `tbl_wallet_master_history.id DESC`
          )

          let tbl_vendar_documents = await Model.getAllData(
            `*`,
            `tbl_vendar_documents`,
            `userid=${result[0].id}`,
            1,
            1
          )
          if (tbl_vendar_documents) {


            result[0].Documentation = JSON.stringify(tbl_vendar_documents)

          } else {

            result[0].Documentation = null

          }

          if (WalletHistory) {

            let arr = []

            let wait = await WalletHistory.map((ival, i) => {

              arr.push([i + 1, ival.amount, ival.debited_credited, ival.reason, ival.created_At])

            })


            await Promise.all(wait);

            result[0].wallethistory = JSON.stringify(arr);

            //  console.log(result,1353);

            res.send(result);
            res.status(200);
          } else {

            result[0].wallethistory = null;
            // console.log(result);

            res.send(result);
            res.status(200);

          }


          // console.log(result,"670");
          // res.status(200);
          // res.send(res1);
        }

      }
    }


  } catch (error) {
    endConnection();
    console.log(chalk.red(error));
    next(error);
    res.status(500)
  }


}


const UpdateVendarDocument = async (req, res, next) => {

  const tableName = req.params.tableName;
  const id = req.params.id;
  const body = req.body;
  const Files = req.files;
  try {



    // console.log(Files[body.driving_licence_front] )

    let UploadImageChck = await Model.getAllData(
      `*`,
      `${tableName}`,
      `userid= ${id}`,
      1,
      1
    )
    if (UploadImageChck) {

      // console.log(UploadImageChck,"UploadImageChck");


      if (Files[body.driving_licence_front] == undefined) {

        body.driving_licence_front = body.driving_licence_front;

      } else {

        Files[body.driving_licence_front] = { file: Files[body.driving_licence_front] }

        body.driving_licence_front = await UploadDocument(Files[body.driving_licence_front], id, UploadImageChck[0].driving_licence_front ? true : false, UploadImageChck[0].driving_licence_front);

        if (body.driving_licence_front == undefined) {
          body.driving_licence_front = null
        }

      }

      if (Files[body.driving_licence_back] == undefined) {

        body.driving_licence_back = body.driving_licence_back;

      } else {
        Files[body.driving_licence_back] = { file: Files[body.driving_licence_back] }

        body.driving_licence_back = await UploadDocument(Files[body.driving_licence_back], id, UploadImageChck[0].driving_licence_back ? true : false, UploadImageChck[0].driving_licence_back);

        if (body.driving_licence_back === undefined) {
          body.driving_licence_back = null;
        }
      }

      if (Files[body.aadhar_front] == undefined) {

        body.aadhar_front = body.aadhar_front;

      } else {
        Files[body.aadhar_front] = { file: Files[body.aadhar_front] }

        body.aadhar_front = await UploadDocument(Files[body.aadhar_front], id, UploadImageChck[0].aadhar_front ? true : false, UploadImageChck[0].aadhar_front);

        if (body.aadhar_front === undefined) {
          body.aadhar_front = null;
        }
      }

      if (Files[body.aadhar_back] == undefined) {

        body.aadhar_back = body.aadhar_back;

      } else {

        Files[body.aadhar_back] = { file: Files[body.aadhar_back] }
        body.aadhar_back = await UploadDocument(Files[body.aadhar_back], id, UploadImageChck[0].aadhar_back ? true : false, UploadImageChck[0].aadhar_back);

        if (body.aadhar_back == undefined) {
          body.aadhar_back = null
        }

      }

      if (Files[body.pancard_front] == undefined) {

        body.pancard_front = body.pancard_front;

      } else {

        Files[body.pancard_front] = { file: Files[body.pancard_front] }
        body.pancard_front = await UploadDocument(Files[body.pancard_front], id, UploadImageChck[0].pancard_front ? true : false, UploadImageChck[0].pancard_front);

        if (body.pancard_front == undefined) {
          body.pancard_front = null
        }

      }

      if (Files[body.pancard_back] == undefined) {

        body.pancard_back = body.pancard_back;

      } else {

        Files[body.pancard_back] = { file: Files[body.pancard_back] }
        body.pancard_back = await UploadDocument(Files[body.pancard_back], id, UploadImageChck[0].pancard_back ? true : false, UploadImageChck[0].pancard_back);

        if (body.pancard_back == undefined) {
          body.pancard_back = null
        }

      }

      //  console.log(body)
      //  console.log(tableName,"tableName")
      //  console.log(id,"id")


      const result = await Model.updateMaster(
        tableName,
        id,
        body,
        columname = "userid"
      );
      if (result) {
        // console.log(result);
        res.status(200);
        res.send(result);
      }
    }
    endConnection();
    //  res.send("Success")

  } catch (error) {
    endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
}


const EditCabdata = async (req, res, next) => {
  try {

    let body = req.body;

    console.log(body, "body");

    console.log(req.files, "4654564")

    let File = ["file1", "file2", "file3", "file4"]

    // console.log(req.files)

    let wait = await File.map(async (ival, i) => {
      console.log(ival);
      if (ival == 'file1' && req.files.file1 !== undefined) {
        body.cab_image_front = await UploadDocument1(req.files.file1, body.vendor, true, body.cab_image_front);
      } else {
        delete body.cab_image_front
      }


      if (ival == 'file2' && req.files.file2 !== undefined) {
        body.cab_image_back = await UploadDocument1(req.files.file2, body.vendor, true, body.cab_image_back);
      } else {
        delete body.cab_image_back
      }


      if (ival == 'file3' && req.files.file3 !== undefined) {
        body.cab_image_side = await UploadDocument1(req.files.file3, body.vendor, true, body.cab_image_side);
      } else {
        delete body.cab_image_side
      }

      if (ival == 'file4' && req.files.file4 !== undefined) {
        body.cab_insurance = await UploadDocument1(req.files.file4, body.vendor, true, body.cab_insurance);
      } else {
        delete body.cab_insurance
      }

    })

    //  await Promise.all(wait)

    // delete body.d_front;
    // delete body.d_back;
    // delete body.police_c;

    delete body.file1;
    delete body.file2;
    delete body.file3;
    delete body.file4;

    console.log(body, "1739");

    let result = await Model.updateMaster(
      `tbl_vendor_cabs`,
      req.params.id,
      body
    )



    if (result) {
      console.log(result);
      let FetchData = await Model.getAllData(
        `tbl_vendor_cabs.*,tbl_user_web.username`,
        `tbl_vendor_cabs,tbl_user_web`,
        `tbl_vendor_cabs.vendor = tbl_user_web.id and tbl_user_web.status = 1`,
        1,
        `tbl_user_web.id`
      )
      if (FetchData) {
        console.log(FetchData);
        res.send(FetchData)
        res.status(200)

      } else {

        res.send(false)
        res.status(400)

      }

    } else {

      res.send(false)
      res.status(400)

    }

  } catch (error) {
    endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
}


const EditDriverdata = async (req, res, next) => {
  try {

    let body = req.body;

    console.log(body, "body");

    console.log(req.files)

    let File = ["d_front", "d_back", "police_c", "driver_image1"]

    // console.log(req.files)

    let wait = await File.map(async (ival, i) => {
      console.log(ival);
      if (ival == 'd_front' && req.files.d_front !== undefined) {
        body.driving_license_front = await UploadDocument1(req.files.d_front, body.vendor, true, body.d_front);
      } else {
        delete body.driving_license_front
      }


      if (ival == 'd_back' && req.files.d_back !== undefined) {
        body.driving_license_back = await UploadDocument1(req.files.d_back, body.vendor, true, body.d_back);
      } else {
        delete body.driving_license_back
      }


      if (ival == 'police_c' && req.files.police_c !== undefined) {
        body.police_verify = await UploadDocument1(req.files.police_c, body.vendor, true, body.police_c);
      } else {
        delete body.police_verify
      }

      if (ival == 'driver_image1' && req.files.driver_image1 !== undefined) {
        body.driver_image = await UploadDocument1(req.files.driver_image1, body.vendor, true, body.driver_image1);
      } else {
        delete body.driver_image
      }

    })

    //  await Promise.all(wait)

    delete body.d_front;
    delete body.d_back;
    delete body.police_c;
    delete body.driver_image1

    // delete body.file1;
    // delete body.file2; 
    // delete body.file3;  

    console.log(body, "1739");

    let result = await Model.updateMaster(
      `tbl_vendor_drivers`,
      req.params.id,
      body)



    if (result) {

      let FetchData = await Model.getAllData(
        `tbl_vendor_drivers.*,tbl_user_web.username`,
        `tbl_vendor_drivers,tbl_user_web`,
        `tbl_vendor_drivers.vendor = tbl_user_web.id and tbl_user_web.status = 1`,
        1,
        `tbl_user_web.id`
      )
      if (FetchData) {
        // console.log(FetchData);
        res.send(FetchData)
        res.status(200)

      } else {

        res.send(false)
        res.status(400)

      }

    } else {

      res.send(false)
      res.status(400)

    }

  } catch (error) {
    endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
}

const Addcabs = async (req, res, next) => {
  try {

    let body = req.body;
    let File = req.body.file;

    File = JSON.parse(File)

    // console.log(File)

    let wait = await File.map(async (ival, i) => {

      if (ival == 'file1' && req.files.file1) {
        body.cab_image_front = await UploadDocument1(req.files.file1, body.vendor)
      } else if (ival == 'file2' && req.files.file2) {
        body.cab_image_back = await UploadDocument1(req.files.file2, body.vendor);
      } else if (ival == 'file3' && req.files.file3) {
        body.cab_image_side = await UploadDocument1(req.files.file3, body.vendor);
      } else if (ival == 'file4' && req.files.file4) {
        body.cab_insurance = await UploadDocument1(req.files.file4, body.vendor);
      }
    });

    await Promise.all(wait);


    delete body.file1;
    delete body.file2;
    delete body.file3;
    delete body.file4;
    delete body.file;

    // console.log(body,"1858");

    let result = await Model.addMaster(`tbl_vendor_cabs`, body)

    if (result) {

      // console.log(result,"1864");

      let FetchData = await Model.getAllData(
        `tbl_vendor_cabs.*,tbl_user_web.username`,
        `tbl_vendor_cabs,tbl_user_web`,
        `tbl_vendor_cabs.vendor = tbl_user_web.id and tbl_user_web.status = 1`,
        1,
        `tbl_user_web.id`
      )
      if (FetchData) {
        // console.log(FetchData);
        res.send(FetchData)
        res.status(200)
      }

    }

  } catch (error) {
    endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
}


const ConfirmActiveTrip = async (req, res, next) => {

  try {

    let body = req.body;

    // console.log(body)

    let CustomerId = await Model.getAllData(
      `tbl_user_web.id as cusId`,
      `tbl_trips,tbl_user_web`,
      `tbl_trips.id = ${body.trip_id} and tbl_trips.customer_id = tbl_user_web.id and tbl_user_web.status = 1`,
      1,
      1
    )

    if (CustomerId) {

      body.customer_id = CustomerId[0].cusId;

      let Data = await Model.addMaster(`tbl_active_trips`, body)

      if (Data) {

        let UpdateBiddings = await Model.updateMaster(
          `tbl_bidding_trips`,
          body.trip_id,
          { status: 'triptaken' },
          "trip_id"
        )

        if (UpdateBiddings) {


          let ActiveTrips = await Model.getAllData(
            `*`,
            `tbl_bidding_trips`,
            `vendor_id=${body.vendor_id}`,
            1,
            `id`
          )
          if (ActiveTrips) {

            res.send(ActiveTrips)
            res.status(200)

          }

        }

      }
      // console.log(CustomerId);
    }


  } catch (error) {

    endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
}

const Addcabs1 = async (req, res, next) => {
  try {

    let body = req.body;

    // console.log(body);

    // console.log(req.files)

    let File = ["file1", "file2", "file3", "file4"]

    // console.log(File)

    let wait = await File.map(async (ival, i) => {

      if (ival == 'file1' && req.files.file1) {
        body.cab_image_front = await UploadDocument1(req.files.file1, body.vendor)
      } else if (ival == 'file2' && req.files.file2) {
        body.cab_image_back = await UploadDocument1(req.files.file2, body.vendor);
      } else if (ival == 'file3' && req.files.file3) {
        body.cab_image_side = await UploadDocument1(req.files.file3, body.vendor);
      } else if (ival == 'file4' && req.files.file4) {
        body.cab_insurance = await UploadDocument1(req.files.file4, body.vendor);
      }
    });

    await Promise.all(wait)


    delete body.file1;
    delete body.file2;
    delete body.file3;
    delete body.file4;
    delete body.file;

    // console.log(body,"1858");

    let result = await Model.addMaster(`tbl_vendor_cabs`, body)

    if (result) {

      // console.log(result,"1864");

      let FetchData = await Model.getAllData(
        `tbl_vendor_cabs.*,tbl_user_web.username`,
        `tbl_vendor_cabs,tbl_user_web`,
        `tbl_vendor_cabs.vendor = tbl_user_web.id and tbl_user_web.status = 1 and tbl_vendor_cabs.vendor =${body.vendor} `,
        1,
        `tbl_user_web.id`
      )
      if (FetchData) {
        // console.log(FetchData);
        res.send(FetchData)
        res.status(200)
      }

    }

  } catch (error) {
    endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
}

const AddDriverdata1 = async (req, res, next) => {
  try {

    let body = req.body;


    let checkDriver = await Model.getAllData(
      `*`,
      `tbl_vendor_drivers`,
      `driver_mobile = '${body.driver_mobile}' or driving_license_number = '${body.driving_license_number}'`,
      1,
      1
    )

    console.log(checkDriver, "2757");

    if (checkDriver.length == 0) {

      let File = req.body.file;

      File = JSON.parse(File)



      let wait = await File.map(async (ival, i) => {

        if (ival == 'file1' && req.files.file1) {
          body.driving_license_front = await UploadDocument1(req.files.file1, body.vendor)
        } else if (ival == 'file2' && req.files.file2) {
          body.driving_license_back = await UploadDocument1(req.files.file2, body.vendor);
        } else if (ival == 'file3' && req.files.file3) {
          body.police_verify = await UploadDocument1(req.files.file3, body.vendor);
        } else if (ival == 'file4' && req.files.file4) {
          body.driver_image = await UploadDocument1(req.files.file4, body.vendor);
        }
      });

      await Promise.all(wait)

      delete body.file1;
      delete body.file2;
      delete body.file3;
      delete body.file4;
      delete body.file;

      // console.log(body,"1858");

      let result = await Model.addMaster(`tbl_vendor_drivers`, body)

      if (result) {

        // console.log(result,"1864");

        let FetchData = await Model.getAllData(
          `tbl_vendor_drivers.*,tbl_user_web.username`,
          `tbl_vendor_drivers,tbl_user_web`,
          `tbl_vendor_drivers.vendor = tbl_user_web.id and tbl_user_web.status = 1 and tbl_vendor_drivers.vendor =${body.vendor} `,
          1,
          `tbl_user_web.id`
        )
        if (FetchData) {
          // console.log(FetchData);
          res.send(FetchData)
          res.status(200)
        }

      }

    } else {

      res.send(false)
      res.status(400)

    }

  } catch (error) {
    endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
}

const AddDriverdata = async (req, res, next) => {
  try {

    let body = req.body;

    // console.log(body);

    console.log(req.files)

    let File = req.body.file;

    File = JSON.parse(File)

    // console.log(File)

    let wait = await File.map(async (ival, i) => {

      if (ival == 'file1' && req.files.file1) {
        body.driving_license_front = await UploadDocument1(req.files.file1, body.vendor)
      } else if (ival == 'file2' && req.files.file2) {
        body.driving_licence_back = await UploadDocument1(req.files.file2, body.vendor);
      } else if (ival == 'file3' && req.files.file3) {
        body.police_verify = await UploadDocument1(req.files.file3, body.vendor);
      }
    });

    await Promise.all(wait)

    delete body.file1;
    delete body.file2;
    delete body.file3;
    delete body.file;

    let result = await Model.addMaster(`tbl_vendor_drivers`, body)

    if (result) {

      let FetchData = await Model.getAllData(
        `tbl_vendor_drivers.*,tbl_user_web.username`,
        `tbl_vendor_drivers,tbl_user_web`,
        `tbl_vendor_drivers.vendor = tbl_user_web.id and tbl_user_web.status = 1`,
        1,
        `tbl_user_web.id`
      )
      if (FetchData) {
        // console.log(FetchData);
        res.send(FetchData)
        res.status(200)
      }

    }

  } catch (error) {
    endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
}


const UpdateUniqueCity = async (req, res, next) => {
  let body = req.body;
  let id = req.params.id;
  try {
    console.log("check")
    let check = await CmsContent.getFreedom(
      `*`,
      `tbl_city`,
      `city = '${body.city}'`,
      1,
      1
    );

    // console.log(check)

    if (!check.length) {

      const result = await CmsContent.updateMaster(
        `tbl_city`,
        id,
        body,
        `id`
      );
      if (result) {
        res.status(200);
        result.body = body
        res.send(result);
      }
      // db end connection
      endConnection();

    } else {
      let data = false;

      res.send(data)
    }




  } catch (error) {
    //db end connection
    endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
}


const AddUniqueValueCity = async (req, res, next) => {
  const tableName = req.params.tableName;
  const body = req.body;

  try {

    const Checkdata = await Model.getAllData(
      `*`,
      `${tableName}`,
      `city = '${body.city}'`,
      1,
      1
    );
    if (Checkdata.length) {
      let data = false;
      res.send(data)
    } else {

      const result = await Model.addMaster(tableName, body);
      if (result) {
        res.send(result);
      }

    }

  } catch (error) {
    //db end connection
    endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
}

const AddUniqueValue = async (req, res, next) => {
  const tableName = req.params.tableName;
  const body = req.body;

  try {

    const Checkdata = await Model.getAllData(
      `*`,
      `${tableName}`,
      `state = '${body.state}'`,
      1,
      1
    );
    if (Checkdata.length) {
      let data = false;
      res.send(data)
    } else {

      const result = await Model.addMaster(tableName, body);
      if (result) {
        res.send(result);
      }

    }

  } catch (error) {
    //db end connection
    endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
}


const deleteMaster = async (req, res, next) => {
  const tableName = req.params.tableName;

  const id = req.params.id;
  try {
    const result = await Model.deleteMasterfromTable(
      tableName,
      `id=${id}`
    );
    //console.log(result);
    if (result) {
      // const RD = await DeleteToRedis(tableName, id, 159);

    }
    //db end connection
    endConnection();
    res.send(result);
  } catch (error) {
    //db end connection
    endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
};


const DownloadFile = async (req, res, next) => {

  let body = req.params.filename;
  let name = req.params.name;

  try {


    let uploadPath = __dirname + '/Images/' + `${name}/` + `${body}`;

    // console.log(uploadPath)

    res.sendFile(uploadPath)

  } catch (error) {
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }

}


const UserProfile = async (req, res, next) => {

  let body = req.params.filename;
  // let name = req.params.name;

  try {


    let uploadPath = __dirname + '/Images/UserProfile/' + `${body}`;

    // console.log(uploadPath)

    res.sendFile(uploadPath)

  } catch (error) {
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }

}


const NewTrips = async (id) => {

  let finalarray = [];


  try {

    // let d = moment(new Date()).format('MM-DD-YYYY HH:MM:SS');

    // console.log(d);

    let UserTripLocation = await Model.getAllData(
      `travel_location,id`,
      `tbl_user_web`,
      `status = 1 and id = ${id}`,
      1,
      1
    )

    let LocationLoop = JSON.parse(UserTripLocation[0].travel_location);

    // console.log(LocationLoop,"UserTripLocation");

    let result = await Model.getAllData(
      `tbl_trips.*,tbl_state.id as PickState,StateData.id as DropState,tbl_user_web.username as customer_name,tbl_city.city as pickuplocation_name,new_city.city as drop_location_name`,
      `tbl_trips,tbl_user_web,tbl_city,tbl_city as new_city,tbl_state,tbl_state as StateData`,
      `tbl_state.id = tbl_city.state_id and tbl_trips.trip_status = 'active' and StateData.id = new_city.state_id  and tbl_user_web.id = tbl_trips.customer_id and tbl_trips.trip_assigned_to is null and tbl_trips.trip_status = 'active' and tbl_trips.pickup_location=tbl_city.id and tbl_trips.drop_location = new_city.id `,
      1,
      `tbl_trips.id DESC`
    );



    let NewResult = []

    if (LocationLoop != null) {
      let wait1 = await result.map((ival, i) => {
        LocationLoop.map((jval, j) => {
          //  console.log(ival.PickState,jval,ival.DropState);
          if (ival.PickState == jval && ival.DropState == jval) {
            //  console.log(ival);
            ival.bidding_amount = 'No bidding';
            ival.tbl_bidding_id = null;
            NewResult.push(ival)
          }
        })
      })

      await Promise.all(wait1)

    }

    let tbl_bidding_trips = await Model.getAllData(
      `*`,
      `tbl_bidding_trips`,
      `vendor_id = ${id} and status='waiting'`,
      1,
      1
    );

    let NewArray = [];

    let wait = NewResult.map((ival, i) => {
      tbl_bidding_trips.map((jval, j) => {



        if (ival.id == jval.trip_id && jval.vendor_id == id) {

          ival.bidding_amount = jval.req_amount;
          ival.tbl_bidding_id = jval.id;

          NewArray.push(ival);

        }


      })
    })

    await Promise.all(wait)

    //  console.log(NewResult,"3150");

    if (NewResult) {
      // console.log('====================================');

      let wait = await NewResult.map((ival, i) => {

        let pickDate = new Date(ival.pickup_date);
        // console.log(pickDate.getTime(),'====',new Date().getTime());

        if (pickDate.getTime() > new Date().getTime()) {
          if (ival.trip_id == '88DIFWJ2VJ') {
            // console.log(ival,"654654")
          }
          finalarray.push(ival)
        }

        //console.log(ival.pickup_date); 

      })



      await Promise.all(wait);

      return finalarray
      // console.log('====================================');
    }


  } catch (error) {
    console.log(error);
  }
}

// CheckTRIPS()

const TripsJsons = async (req, res, next) => {
  try {


    // let id = req.params.id;
    // console.log(id);

    let result = await Model.getAllData(
      `tbl_trips.*,tbl_user_web.username as customer_name,tbl_city.city as pickuplocation_name,new_city.city as drop_location_name`,
      `tbl_trips,tbl_user_web,tbl_city,tbl_city as new_city`,
      `tbl_trips.trip_status = 'active' and tbl_user_web.id = tbl_trips.customer_id and tbl_trips.pickup_location=tbl_city.id and tbl_trips.drop_location = new_city.id `,
      1,
      `tbl_trips.id DESC`
    );
    // let result = await NewTrips(id)
    if (result) {
      // console.log(result.length); 
      res.status(200)
      res.send(result)
    }

  } catch (error) {
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }

}


const TripsJson = async (req, res, next) => {
  try {


    let id = req.params.id;
    // console.log(id);
    // let result = await Model.getAllData(
    //   `tbl_trips.*,tbl_user_web.username as customer_name,tbl_city.city as pickuplocation_name,new_city.city as drop_location_name`,
    //   `tbl_trips,tbl_user_web,tbl_city,tbl_city as new_city`,
    //   `tbl_user_web.id = tbl_trips.customer_id and tbl_trips.pickup_location=tbl_city.id and tbl_trips.drop_location = new_city.id `,
    //   1,
    //   1
    // )
    let result = await NewTrips(id);

    // console.log(result,"3749");

    if (result.length) {

      let wait = await result.map(async (ival, i) => {

        let Split_it = ival.pickup_date.split(" ");

        let Split_date = Split_it[0].split("-");

        let Split_time = Split_it[1].split(":");

        let fullDate = `${Split_date[0]}/${parseInt(Split_date[1]) + 1}/${Split_date[2]} ${Split_time[0]}:${Split_time[1]}`;

        let hourago = new Date(fullDate);

        let time = await formatAMPM(hourago)

        ival.new_pickup_date = `${hourago.getDate() > 9 ? hourago.getDate() : `0${hourago.getDate()}`}-${hourago.getMonth() > 9 ? hourago.getMonth() : `0${hourago.getMonth()}`}-${hourago.getFullYear()} at ${time}`

        // console.log(ival.new_pickup_date,time,"fullDate");

        if (ival.trip_type != 'One Way') {

          let Split_it1 = ival.drop_date.split(" ");

          let Split_date1 = Split_it1[0].split("-");

          let Split_time1 = Split_it1[1].split(":");

          let fullDate1 = `${Split_date1[0]}/${parseInt(Split_date1[1]) + 1}/${Split_date1[2]} ${Split_time1[0]}:${Split_time1[1]}`;

          let hourago1 = new Date(fullDate1);

          let time1 = await formatAMPM(hourago1)

          ival.new_drop_date = `${hourago1.getDate() > 9 ? hourago1.getDate() : `0${hourago1.getDate()}`}-${hourago1.getMonth() > 9 ? hourago1.getMonth() : `0${hourago1.getMonth()}`}-${hourago1.getFullYear()} at ${time1}`
        }

      });
      await Promise.all(wait)
    }

    // console.log(result,"3749");



    if (result) {
      res.status(200)
      res.send(result)
    }

  } catch (error) {
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }

}

const formatAMPM = async (date) => {

  var hours = date.getHours();
  // console.log(hours,"hours")
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

const APPregister = async (req, res, next) => {
  try {

    console.log(req.body);
    let body = req.body;

    body.travel_location = JSON.stringify([54])

    let checkExistUser = await Model.getAllData(
      `*`,
      `tbl_user_web`,
      `email_id='${body.email_id}' or mobile='${body.mobile}'`,
      1,
      1
    )

    console.log(checkExistUser, "USEr");

    if (checkExistUser.length) {

      res.status(303)
      res.send(false)
      res.end('User Already Exists')

    } else {


      let Userlogincheck = await Model.addMaster(
        `tbl_user_web`,
        req.body
      )
      if (Userlogincheck) {

        let Result = await Model.getAllData(
          `*`,
          `tbl_user_web`,
          `id = ${Userlogincheck.insertId}`,
          1,
          1

        )
        if (Result) {
          console.log(Result);
          res.status(200)
          res.send(Result)
        }


      }

    }

  } catch (error) {
    //db end connection
    endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }

}


const CancelTrip = async (req, res, next) => {

  let id = req.params.id;
  let body = req.body;
  console.log(body, id);


  try {

    //  let tbl_bidding_trips = await Model.getAllData(
    //    `*`,
    //    `tbl_bidding_trips`,
    //    `trip_id = ${body.trip_id}`,
    //    1,
    //    1
    //    )
    let tbl_bidding_trips = await Model.updateMaster(
      `tbl_bidding_trips`,
      body.bid_id,
      { status: 'waiting' },
      "id"
    )
    if (tbl_bidding_trips) {

      let tbl_trips = await Model.updateMaster(
        `tbl_trips`,
        body.trip_id,
        { trip_status: 'active', trip_assigned_to: null },
        "id"
      )

      if (tbl_trips) {

        // console.log(tbl_bidding_trips,"3331")

        // console.log(tbl_trips,"3333")

        let tbl_user_web = await Model.getAllData(
          `*`,
          `tbl_user_web`,
          `id = ${id}`,
          1,
          1
        )
        // console.log(tbl_user_web,"3342");
        if (tbl_user_web.length) {

          let wallet = parseInt(tbl_user_web[0].wallet);

          let trip_amount = parseInt(body.trip_amount);

          let vendor_req_amount = parseInt(body.vendor_req_amount)

          let penalty = (trip_amount - vendor_req_amount) * 0.5;


          let Newwalletamount = wallet + penalty;


          let tbl_trips1 = await Model.updateMaster(
            `tbl_trips`,
            body.trip_id,
            { trip_status: 'active', trip_assigned_to: null },
            "id"
          )

          // console.log(tbl_trips1,"3364");

          let User_Wallet = await Model.updateMaster(
            `tbl_user_web`,
            id,
            { wallet: Newwalletamount },
            "id"
          )

          // console.log(User_Wallet,"3373")

          let arr = {}
          arr.amount = Math.abs(penalty);
          arr.debited_credited = 'credited'
          arr.reason = 'trip cancelled'
          arr.user_id = id;

          let Wallet_History = await Model.addMaster(`tbl_wallet_master_history`, arr)
          // console.log(Wallet_History,"3382")
          if (Wallet_History) {

            // KARAN karan
            // console.log(id,"3394");
            let ActiveTrips = await Model.getAllData(
              `*`,
              `tbl_bidding_trips`,
              `vendor_id=${id}`,
              1,
              `id DESC`
            )
            // console.log(id,ActiveTrips,"3394");
            if (ActiveTrips) {

              res.send(ActiveTrips)
              res.status(200)

            } else {
              res.send(false)
              res.status(400)
            }

          }


        }


      }



    }


  } catch (error) {
    //db end connection
    endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
}


const VendorUserLogout = async (req, res, next) => {
  let body = req.body;
  let id = req.params.id;
  body.login_status = 0
  try {
    // console.log("HELLO");
    // console.log(body);

    let result = await Model.updateMaster(
      `tbl_user_web`,
      id,
      body
    )

    if (result) {
      res.send(true)
      res.status(200)
    } else {
      res.status(500)
      res.send(false)
    }

  } catch (error) {
    //db end connection
    endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
}

const Add_Announcement = async (req, res, next) => {
  let body = req.body;
  let id = req.params.id;


  console.log(req.files)
  try {

    if (req.files.images !== undefined) {
      // UploadDocument
      body.images = await UploadDocument1(req.files.images, id)
    } else {
      delete body.images
    }

    body.admin_id = id;

    let AddAnnounce = await Model.addMaster(
      `tbl_announcement`,
      body
    )

    console.log(AddAnnounce);
    console.log(body);
    if (AddAnnounce) {

      let getData = await Model.getAllData(
        `*`,
        `tbl_announcement`,
        `status = 1`,
        1,
        `id DESC`
      )

      if (getData) {
        res.send(getData)
        res.status(200)
      }

    } else {
      res.send(false)
      res.status(400)
    }

  } catch (error) {
    endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
}

const FetchAnnounce = async (req, res, next) => {
  try {

    let getData = await Model.getAllData(
      `*`,
      `tbl_announcement`,
      `status = 1`,
      1,
      `id DESC`
    )

    if (getData) {
      res.send(getData)
      res.status(200)
    } else {
      res.send(false)
      res.status(400)
    }

  } catch (error) {
    endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
}

const DeleteDriver = async (req, res, next) => {
  let id = req.params.id;
  try {
    console.log("body", id);
    let updateDriver = await Model.updateMaster(
      `tbl_vendor_drivers`,
      id,
      { hide_show: 0 },
      "id"
    )

    if (updateDriver) {

      let checkdata = await Model.getAllData(
        `*`,
        `tbl_vendor_drivers`,
        `id = ${id}`,
        1,
        1
      )
      if (checkdata.length) {

        res.send(checkdata)
        res.status(200)
      }

    } else {
      res.status(200)
      res.send(false)
    }


  } catch (error) {
    endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
}


const paymentMethod = async (req, res, next) => {

  try {
    let body = req.body;

    let amount = body.amount + `00`;

    const userDetail = await Model.getAllData(
      `*`,
      `tbl_user_web`,
      `login_token='${body.login_token}' and status = 1`,
      1,
      1
    )
    // console.log(userDetail)
    if (userDetail.length == 0) {
      res.send('no user found')
      res.status(404)
    }

    // const instance = new Razorpay({
    //   key_id: TESTRAZORPAY_KEY_ID,
    //   key_secret: TESTRAZORPAY_SECRET,
    // });

    const instance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_SECRET,
    });

    const options = {
      amount: parseInt(amount), // amount in smallest currency unit
      currency: "INR",
      receipt: "receipt_order_74394",
    };

    const order = await instance.orders.create(options);

    if (!order) return res.status(500).send("Some error occured");


    console.log(order);

    if (order) {
      res.json(order);
    }

  } catch (error) {
    endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
}


const paymentSuccessResponse = async (req, res, next) => {
  try {
    // getting the details back from our font-end
    const {
      orderCreationId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      login_token,
      amount
    } = req.body;
    // console.log(req.body,"Success-body")
    // Creating our own digest
    // The format should be like this:
    // digest = hmac_sha256(orderCreationId + "|" + razorpayPaymentId, secret);
    const shasum = crypto.createHmac("sha256", RAZORPAY_SECRET);

    shasum.update(`${razorpayOrderId}|${razorpayPaymentId}`);

    const digest = shasum.digest("hex");
    // console.log(digest,"==",razorpaySignature )
    // comaparing our digest with the actual signature
    if (digest !== razorpaySignature) {
      return res.status(400).json({ msg: "Transaction not legit!" });
    }

    const userDetail = await Model.getAllData(
      `*`,
      `tbl_user_web`,
      `login_token='${login_token}' and status = 1`,
      1,
      1
    );
    // console.log(userDetail,"userDetail")
    if (userDetail.length == 0) {
      res.send('No user found')
      res.status(500)
    }

    const updateUserWallet = await Model.updateMaster(
      `tbl_user_web`,
      userDetail[0].id,
      { wallet: parseInt(userDetail[0].wallet) + parseInt(amount) },
    )
    // console.log(updateUserWallet,"updateUserWallet")
    if (!updateUserWallet) {
      return res.status(500).send("user wallet update failed");
    }
    const insertWalletHistory = await Model.addMaster(
      `tbl_wallet_master_history`,
      { amount: amount, debited_credited: 'credited', reason: 'wallet amount', user_id: userDetail[0].id, order_id: orderCreationId }
    )
    // console.log(insertWalletHistory)
    if (!insertWalletHistory) {
      return res.status(500).send("user wallet history insert failed");
    }

    // THE PAYMENT IS LEGIT & VERIFIED
    // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT

    if (insertWalletHistory) {
      res.json({
        msg: "success",
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
      });
    }

  } catch (error) {
    res.status(500).send(error);
  }
}

const sendAppDeepLink = async (req, res, next) => {

  let jsonArray = [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "com.r7zerocarbon",
        sha256_cert_fingerprints: ["A9:D7:C4:2E:5C:85:B5:F9:0C:37:DC:EC:F1:17:E2:16:2D:79:34:B0:95:C9:94:22:03:18:8C:58:DA:3E:53:2D"]
      }
    }
  ];
  res.json(jsonArray)
}

const DeleteCab = async (req, res, next) => {
  let id = req.params.id;
  try {
    console.log("body", id);
    let updateDriver = await Model.updateMaster(
      `tbl_vendor_cabs`,
      id,
      { hide_show: 0 },
      "id"
    )

    if (updateDriver) {

      let checkdata = await Model.getAllData(
        `*`,
        `tbl_vendor_cabs`,
        `id = ${id}`,
        1,
        1
      )
      if (checkdata.length) {

        res.send(checkdata)
        res.status(200)
      }

    } else {
      res.status(200)
      res.send(false)
    }


  } catch (error) {
    endConnection();
    console.error(chalk.red(error));
    res.status(500);
    next(error);
  }
}


module.exports = {
  LoginAdmin,
  logOutAdminUser,
  DownloadImage,
  AddUser,
  DeleteCab,
  getFreedom,
  updateMaster,
  sendAppDeepLink,
  deleteMaster,
  Check_Db,
  AddVendarDocument,
  DownloadFile,
  UpdateVendarDocument,
  AddUniqueValue,
  AddUniqueValueCity,
  UpdateUniqueCity,
  AddTrips,
  TripsData,
  AppLogin,
  DeleteDriver,
  sendOtp,
  RefreshApp,
  APPregister,
  UserProfile,
  updateMasterApp,
  TripsJson,
  UpdateUser,
  UploadUserProfile,
  addMaster,
  CancelTrip,
  AppDocumentUpload,
  AddBidTrips,
  CheckoutNotify,
  UpdateToken,
  SendAssignedTripNotification,
  UpdateBiddingApproval,
  AddDriverdata,
  EditDriverdata,
  UpdateBiddingTrip,
  TripsJsons,
  AddDriverdata1,
  Addcabs1,
  Addcabs,
  Add_Announcement,
  ConfirmActiveTrip,
  StartandEndTrip,
  CheckOtpandPassword,
  VendorUserLogout,
  OTPchecksadfsf,
  EditCabdata,
  FetchAnnounce,
  eventsHandler,
  BackGroundRefreshApp,
  paymentMethod,
  getFreedomWithLoginCheck,
  paymentSuccessResponse
}