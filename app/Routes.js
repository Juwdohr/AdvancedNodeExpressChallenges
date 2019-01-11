const bcrypt = require('bcrypt');
const passport = require('passport');


module.exports = function(app, db) {
  app.route('/').get((req, res) => {
      res.render(process.cwd() + '/views/pug/index', { title: 'Homepage', message: 'Please login', showLogin: true, showRegistration: true });
    });
    
  app.route('/register').post((req, res, next) => {
    db.collection('users').findOne({ username: req.body.username }, (err, user) => {
      if(err) {
        next(err);
      } else if(user) {
        res.redirect('/');
      } else {
        const hash = bcrypt.hashSync(req.body.password, 12);
        db.collection('users').insertOne({name: req.body.username, password: hash}, (err, doc) => {
          if(err) {
            res.redirect('/');
          } else {
            next(null, user);
          }
        })
      }
    })},
    passport.authenticate('local'),
    (req, res, next) => {
      res.redirect('/profile');
    }
  );

  app.route('/auth/github').get(passport.authenticate('github'));
    
  app.route('/auth/github/callback').get(passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
    req.session.user_id = req.user.id
    res.redirect('/chat');
  });
  
  app.route('/login').post(passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/chat');
  });

  function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated())
      return next();
    res.redirect('/')
  }

  app.route('/profile').get(ensureAuthenticated, (req, res) => {
    res.render(process.cwd() + '/views/pug/profile', {username: req.user.username})
  });
  
  app.route('/chat').get(ensureAuthenticated, (req, res) => {
    // console.log(req.session);
    res.render(process.cwd() + '/views/pug/chat', {username: req.user});
  });
   
  app.route('/logout').get((req, res) => {
    req.logout();
    res.redirect('/');
  });

  app.use((req, res, next) => {
    res.status(404).type('text').send('Not Found');
  });
}