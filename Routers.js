
var express = require('express');
var router = express.Router();
var Controller = require('./Controllers')



 router.get('/gett',Controller.GetData);



 module.exports = router;

 