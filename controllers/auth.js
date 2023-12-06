const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const formData = require('form-data');
const Mailgun = require('mailgun.js');

const User = require('../models/user');
const {API_KEY} = require('../config');

const mailgun = new Mailgun(formData);
const mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY || API_KEY});


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
        html: "<h1>You successfully signed up!</h1>"
      })
      .then(msg => console.log({msg})) // logs response data
      .catch(err => console.log({err})); // logs any error
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {path: '/reset', pageTitle: 'Reset Password', errorMessage: message});
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer)=> {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({email: req.body.email})
      .then(user => {
        if (!user) {
          req.flash('error', 'No account with that email found.');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(result => {
        res.redirect('/');
        // Sending a reset pas sword email using Mailgun
        mg.messages.create('sandbox2e0f5587af5d487db2192fb8c995f89f.mailgun.org', {
          from: 'The shop app <shop@node-complete.com>',
          to: [req.body.email],
          subject: 'Password reset',
          html: `
            <p> You requested to reset your password </p>
            <p> Click this <a href='http://localhost:3000/new-password/${token}'>link</a> to set a new password </p>
          `
        })
        .then(msg => console.log({msg})) // logs response data
        .catch(err => console.log({err})); // logs any error
      })
      .catch(err => console.log(err));
  })
}

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
    .then(user => {
      if (!user) {
        req.flash('error', 'Token expired');
        return res.redirect('/login');
      } else {
        let message = req.flash('error');
        if (message.lenght > 0) {
          message = message[0];
        } else {
          message = null;
        }
        res.render('auth/new-password', {
          path: '/new-password',
          pageTitle: 'New Password',
          errorMessage: message,
          userId: user._id.toString(),
          passwordToken: token
        });
      }
    })
    .catch(err => console.log(err));

};

exports.postNewPassword = (req, res, next) => {
  const userId = req.body.userId;
  const newPassword = req.body.password;
  const passwordToken = req.body.passwordToken;
  User.findOne({_id: userId, resetToken: passwordToken, resetTokenExpiration: {$gt: Date.now()} })
    .then(user => {
      if (user) {
        return bcrypt.hash(newPassword, 12)
          .then(hashedPassword => {
            user.password = hashedPassword;
            user.resetToken = undefined;
            user.resetTokenExpiration = undefined;
            user.save();
          })
          .catch(err => console.log(err));
      }
    })
    .then(result => {
      console.log(result);
      res.redirect('/login');
    })
    .catch(err => console.log(err));
};