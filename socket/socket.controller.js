const express = require('express');
const Socket = require('./socket.model');
const socketIo = require('socket.io');
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const chalk = require("chalk");

const getMaster = async (req, res, next) => {
  try {
    console.log(1);

    io.on('http://192.168.1.105:5001/admin/AppLogin/8', data => console.log(data));
    // const result = await Socket.getMaster();
    res.send("result");
  } catch (error) {
    console.error(chalk.red(error));
    // res.status(500);
    // next(error);
  }
};

module.exports = { getMaster };
