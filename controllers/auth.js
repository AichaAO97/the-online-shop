const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  // get the cookie
  // const isLoggedIn = req.get('Cookie').split('=')[1] === 'true';
  console.log(req.session);
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false
  });
};

exports.postLogin = (req, res, next) => {
  // res.setHeader('Set-Cookie', 'loggedIn=true');
  //use session instead of cookies
  User.findById("6560f86c10a2e14b5459cdee")
    .then(user => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      // To avoid rendering the page before the session is updated. therefor you garantee 
      // to get a page with updated data
      req.session.save((err) => {
        console.log(err);
        res.redirect('/');
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