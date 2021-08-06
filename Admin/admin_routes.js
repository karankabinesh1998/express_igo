
var express = require('express');
const { Container } = require('winston');

// const Model = require('../Model');

const router = require("express").Router();

var Controller = require('./admin_controller');

var whitelist = [
  "localhost:3000",
  "localhost:3006",
  "localhost:4000",
  "192.168.0.124:3000",
  "igotaxy.com",
  "192.168.1.105:3008",
  "10.0.2.2:8081",
  "www.igotaxy.in"
   ];

const corsOptionsDelegate = (req, res, next) => {
    try {
      console.log(req.headers.origin,"HEADERS");
      console.log(req.headers.referer,"ORIGINS");
      if (req.headers.origin !== undefined) {
        const splitReferer = req.headers.referer.split("/");
        const splitOrgin = req.headers.origin.split("/");
        const reqOrgin = splitOrgin[2];
        const reqReferer = splitReferer[2];
        console.log(splitReferer[2] + "->" + splitOrgin[2],"29th line ");
        console.log( whitelist.indexOf(reqOrgin),whitelist.indexOf(reqReferer),"30th line")
        if (
          whitelist.indexOf(reqOrgin) !== -1 &&
          whitelist.indexOf(reqReferer) !== -1
        ) {
          
          next();
        }
      } else {
        return res.status(400).json("Unauthorized Routes");
      }
    } catch (error) {
      return res.status(401).json({
        status: 401,
        message: "Invalid Request"
      });
    }
  };

  // console.log(router.route("/login").post(corsOptionsDelegate, Controller.LoginAdmin));

  router
  .route("/login")
  .post(corsOptionsDelegate, Controller.LoginAdmin)


  router
 .route('/filename/:filename?')
 .get(Controller.DownloadImage)

 router
 .route('/check')
 .get(Controller.Check_Db)

 router
 .route('/adduser/:tableName?/:id?/:editid?')
.post(Controller.AddUser)
.put(Controller.UpdateUser)
//  router.post('/login',Controller.LoginAdmin);


router.route('/AddBidTrips/:id?')
.post(Controller.AddBidTrips)

router 
.route('/UploadUserProfile/:id?')
.post(Controller.UploadUserProfile)

router
  .route("/getFullFreedom/getFreedom")
  .put(corsOptionsDelegate,Controller.getFreedom)

  router
  .route("/master/:tableName/:id?/:order?")
  .post(corsOptionsDelegate, Controller.addMaster)
 //.get(corsOptionsDelegate, cmsContent.getMasterValues)
  .put(Controller.updateMaster)
  .delete(corsOptionsDelegate, Controller.deleteMaster);

  router.route('/UpdateBiddingApproval/:tableName/:id?/:vend_id?').put(Controller.UpdateBiddingApproval)

  router
  .route("/appmaster/:tableName/:id?/:order?")
  // .post(corsOptionsDelegate, cmsContent.addMaster)
 //.get(corsOptionsDelegate, cmsContent.getMasterValues)
  .put(Controller.updateMasterApp)

  router
 .route('/vendarfile/:filename/:name')
 .get(Controller.DownloadFile) 

 router 
   .route('/AddUniqueValue/:tableName?')
   .post(corsOptionsDelegate,Controller.AddUniqueValue)

   router 
   .route('/AddUniqueValueCity/:tableName?')
   .post(corsOptionsDelegate,Controller.AddUniqueValueCity)

   router
     .route('/UpdateUniqueCity/:id')
     .put(corsOptionsDelegate,Controller.UpdateUniqueCity)   

 router
     .route('/UpdateVendarDocument/:tableName/:id')
     .post(corsOptionsDelegate,Controller.UpdateVendarDocument)

  router
  .route('/VendarDocument')
  .post(corsOptionsDelegate,Controller.AddVendarDocument)

  router.route('/AppDocumentUpload')
  .post(Controller.AppDocumentUpload)

  router
  .route('/trips/:newcustomer/:id?')
  .post(corsOptionsDelegate,Controller.AddTrips)

  router
  .route('/AppLogin/:id?')
  .post(Controller.AppLogin)
  .get(Controller.RefreshApp)

  router
  .route('/gettrips')
  .get(Controller.TripsData)

  router
  .route('/TripsJson')
  .get(Controller.TripsJson)

  router
  .route('/profile/:filename')
  .get(Controller.UserProfile)

  router.route('/APPregister').post(Controller.APPregister)

router.route('/notify/:token?').get(Controller.CheckoutNotify)
router.route('/SendAssignedTripNotification').post(Controller.SendAssignedTripNotification)

router.route('/UpdateToken/:id?').post(Controller.UpdateToken);



 module.exports = router;

 