const router = require('express').Router();
const socket = require('./socket.controller');

router.route('/').get(socket.getMaster);
module.exports = router;
