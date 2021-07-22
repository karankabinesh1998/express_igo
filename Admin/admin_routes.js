
var express = require('express');
const Model = require('../Model');

const router = require("express").Router();

var Controller = require('./admin_controller');

var whitelist = [
"localhost:3000",
"localhost:3006",
"localhost:4000",
"192.168.0.124:3000",
"igotaxy.com",
"192.168.0.124:3006",
"10.0.2.2:8081"
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
        console.log(splitReferer[2] + "->" + splitOrgin[2]);
        console.log( whitelist.indexOf(reqOrgin),whitelist.indexOf(reqReferer))
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


  router
  .route("/login")
  .post(corsOptionsDelegate, Controller.LoginAdmin)


  router
 .route('/filename/:filename?')
 .get(Controller.DownloadImage)


 router
 .route('/adduser')
.post(Controller.AddUser)
//  router.post('/login',Controller.LoginAdmin);

router
  .route("/getFullFreedom/getFreedom")
  .put(corsOptionsDelegate,Controller.getFreedom)

  router
  .route("/master/:tableName/:id?/:order?")
  // .post(corsOptionsDelegate, cmsContent.addMaster)
 //.get(corsOptionsDelegate, cmsContent.getMasterValues)
  .put(corsOptionsDelegate, Controller.updateMaster)
  .delete(corsOptionsDelegate, Controller.deleteMaster);

 module.exports = router;

 