const router = require("express").Router();
var userController = require('./userController');
var whitelist = [
  "localhost:3000",
  "localhost:3006",
  "localhost:4000",
  "192.168.0.124:3000",
  "igotaxy.com",
  "192.168.1.105:3008",
  "10.0.2.2:8081",
  "www.igotaxy.in",
  "www.cp.igotaxy.in",
  "cp.igotaxy.in"
];

const corsOptionsDelegate = (req, res, next) => {
    try {
      console.log(req.headers.origin, "HEADERS");
      console.log(req.headers.referer, "ORIGINS");
      if (req.headers.origin !== undefined) {
        const splitReferer = req.headers.referer.split("/");
        const splitOrgin = req.headers.origin.split("/");
        const reqOrgin = splitOrgin[2];
        const reqReferer = splitReferer[2];
        console.log(splitReferer[2] + "->" + splitOrgin[2], "29th line ");
        console.log(whitelist.indexOf(reqOrgin), whitelist.indexOf(reqReferer), "30th line")
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
  .route("/register")
  .post(userController.addUser);

  router
  .route("/login")
  .post(userController.loginUser);

  router
  .route("/logout")
  .post(userController.userLogOut);

  module.exports = router;