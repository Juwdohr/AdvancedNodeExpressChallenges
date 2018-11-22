const session = require('express-session');
const passport = require('passport');
const ObjectID = require('mongodb').ObjectId;
const GithubStrategy = require('passport-github').Strategy;
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');

module.exports = function(app, db) {
  
  app.use(session({
    secret: process.env.SECRET,
    saveUninitialized: true,
    resave: true,
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  
  passport.use(new LocalStrategy( function (username, password, done) {
        db.collection('users').findOne({ username: username }, function(err, user) {
          console.log(`User ${username} attempted to log in.`);
          
          if (err) { return done(err); }
          
          if (!user) { return done(null, false); }
          
          if (!bcrypt.compareSync(password, user.password)) { return done(null, false); }
          
          return done(null, user);
        });
      }
  ));
  
  passport.use(new GithubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: 'https://advanced-node-express-challenges.glitch.me/auth/github/callback'
  }, function(accessToken, refreshToken, profile, cb) {
    
    const query = { id: profile.id }
    const  queryOptions = {
      $setOnInsert: {
        id: profile.id,
        username: profile.displayName || 'John Doe',
        photo: profile.avatar_url || '',
        email: profile.email || 'No Public Email',
        created_on: new Date(),
        provider: profile.provider || ''
      },
      $set: {
        last_login: new Date()
      },
      $inc: {
        login_count: 1
      }
    }
    const options = {
      upsert: true,
      new: true,
    }
          
    db.collection('socialusers').findAndModify(query, {}, queryOptions, options, (err, doc) => {
      if(err) {
        console.log(err)
      } else {
        return cb(null, doc.value);
      }
    });
  }));
  
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  passport.deserializeUser((id, done) => {
    const query = { _id: new ObjectID(id) }
    db.collection('users').findOne(query, (err, doc) => {
      if(doc !== null) {
        done(null, doc);
      } else {
        db.collection('socialusers').findOne(query, (err, doc) => {
          done(null, doc);
        });
      }
      
    })
  });
}