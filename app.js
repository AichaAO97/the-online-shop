const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const errorController = require('./controllers/error');
const User = require('./models/user');
const { MONGODB_URI } = require('./config');

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});
const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');



app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
// add another middleware to configure the session set-up
app.use(session({
  secret: 'my-secret',
  resave: false,
  saveUninitialized: false, /*, cookie: {maxAge: }, */
  store: store
}));
app.use(csrfProtection);
app.use(flash());

// all requests will have a user object
// this is a central place where we extract the user to be used anywhere in our app
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        next();
      }
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

mongoose.connect(MONGODB_URI)
  .then(result => {
    app.listen(3000);
  })
  .catch(err => console.log(err));
