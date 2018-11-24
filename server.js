'use strict';

      /* Node Files */
const bodyParser        = require('body-parser'),
      cookieParser      = require('cookie-parser'),
      cors              = require('cors'),
      db                = require('mongodb'),
      express           = require('express'),
      passport          = require('passport'),
      passportSocketIo  = require('passport.socketio'),
      pug               = require('pug'),
      session           = require('express-session'),
      bcrypt            = require('bcrypt'),
      
      /* Local Files */
      auth              = require('./app/Auth.js'),
      fccTesting        = require('./freeCodeCamp/fcctesting.js'),
      routes            = require('./app/Routes.js'),
      
      /* Application Setup */
      app               = express(),
      http              = require('http').Server(app),
      io                = require('socket.io')(http),
      mongo             = db.MongoClient,
      ObjectID          = db.ObjectId,
      sessionStore      = new session.MemoryStore();

/* Application Settings */
app.set('view engine', 'pug');
app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  key:                'connect.sid',
  saveUninitialized:  true,
  secret:             process.env.SECRET,
  store:              sessionStore,
  resave:             false,
}));
app.use( passport.initialize() );
app.use( passport.session() );

/* Application */
mongo.connect(process.env.DATABASE, (err, db) => {
  if(err) console.log(`Database error: ${err}`);
    
  console.log('Successful database connection');

  auth(app, db);
  routes(app, db, io);

  http.listen(process.env.PORT || 3000, () => {
    console.log("Listening on port: " + process.env.PORT);
  });
  
  io.use(passportSocketIo.authorize({
    cookieParser: cookieParser,
    key:          'connect.sid',
    secret:       process.env.SECRET,
    store:        sessionStore,
  }))

  let currentUsers = 0;

  io.on('connection', (socket) => {
    
    const { user } = socket.request;
    
    ++currentUsers;
    io.emit('user', { name: user.name, currentUsers, connected: true });
    
    socket.on('chat message', (msg) => {
      io.emit('chat message', {name: user.name, message: msg})
    })
    
    socket.on('disconnect', () => {
      
      --currentUsers;
      io.emit('user', { name: user.name, currentUsers, connected: true });
      
    });
  });
  
});

fccTesting(app); //For FCC testing purposes