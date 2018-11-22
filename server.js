'use strict';

const express = require('express');
const app = require('express')();
const bodyParser = require('body-parser');
const cors = require('cors');
const pug = require('pug');
const session = require('express-session');
const passport = require('passport');
const mongo = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
const server = require('http').Server(app)
const io = require('socket.io')(server)

/* Local Files */
const auth = require('./app/Auth.js');
const routes = require('./app/Routes.js');
const fccTesting  = require('./freeCodeCamp/fcctesting.js');

app.set('view engine', 'pug');

app.use(cors());
fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


mongo.connect(process.env.DATABASE, (err, db) => {
  if(err) {
    console.log(`Database error: ${err}`);
  } else {
    console.log('Successful database connection');
    
    auth(app, db);
    routes(app, db);
    
    app.listen(process.env.PORT || 3000, () => {
      console.log("Listening on port: " + process.env.PORT);
    });
    
    io.on('connection', socket => {
      io.emit('users', 'a user connected');
    });
  }
});