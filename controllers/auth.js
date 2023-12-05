const bcrypt = require('bcryptjs');
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY || 'a89f75ad7ff5d35d245a06b3c0d3bc1b-0a688b4a-2dc422bf'});

const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  console.log(req.session);
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'SignUp',
    errorMessage: message
  });
}

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({email: email})
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid email or password.');
        return res.redirect('/login');
      }
      bcrypt.compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            //You save to avoid rendering the page before the session is updated. therefor you garantee 
            // to get a page with updated data
            return req.session.save((err) => {
              console.log(err);
              res.redirect('/');
            });
          }
          req.flash('error', 'Invalid email or password.');
          res.redirect('/login');
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({email: email})
    .then(userDoc => {
      if(userDoc) {
        req.flash('error', 'Email already exists!');
        return res.redirect('/signup');
      }
      return bcrypt.hash(password, 12)
        .then (hashedPwd => {
          const user = new User({email, password: hashedPwd, cart: { items: []}});
          return user.save();
        });
    })
    .then(result => {
      res.redirect('/login');
      // Sending a welcome email using Mailgun
      mg.messages.create('sandbox2e0f5587af5d487db2192fb8c995f89f.mailgun.org', {
        from: 'The shop app <shop@node-complete.com>',
        to: [email],
        subject: 'Signup succeeded!',
        text: "Testing some Mailgun awesomeness!",
        html: "<h1>You successfully signed up!</h1>"
      })
      .then(msg => console.log({msg})) // logs response data
      .catch(err => console.log({err})); // logs any error
    })
    .catch(err => {
      console.log(err);
    });
};
