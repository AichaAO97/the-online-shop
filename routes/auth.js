const express = require('express');
const { check, body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.get('/reset', authController.getReset);

router.get('/new-password/:token', authController.getNewPassword);

router.post('/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please Enter a Valid Email')
      // this customized check is not added by the instructor
      .custom((value, { req }) => {
        return User.findOne({ email: value })
          .then(userDoc => {
            if (!userDoc) {
              return Promise.reject("Email doesn't exists!");
            }
          })
      })
    // .normalizeEmail(),
    , body(
      'password',
      'Please enter a password with only numbers and text and at least 5 characters' /* This is the default error msg for all validators*/
    )
      .isLength({ min: 5 /*, max: 10*/ })
      .isAlphanumeric()
      .trim(),

  ],
  authController.postLogin);

router.post('/signup',
  [ // check for input errors in validation, and for logical errors in the controller
    check('email')
      .isEmail()
      .withMessage('Please Enter a Valid Email')
      .custom((value, { req }) => {
        /* The express validator package will check for a custom validator to return true or false, to return a thrown error or to return a promise. In this case it returns a promise because every then block implicitly returns a new promise,
        so if we return a promise then express validator will wait for this promise to be fulfilled and if it
        fulfills with (in our case) nothing,
        so basically no error, then it treats this validation as successful. If it resolves with some rejection
        in the end though, which will happen if we make it into this if block, then express validator will detect this rejection and will store this as an error,
        this message will then be stored as an error message. And this is how we can add our own asynchronous
        validation, asynchronous because we have to reach out to the database which of course is not an instant
        task but express validator will kind of wait for us here.
        */
        return User.findOne({ email: value })
          .then(userDoc => {
            if (userDoc) {
              return Promise.reject('Email already exists!');
            }
          })
      })
    // .normalizeEmail() /* this is a sanitizer */,
    , body(
      'password',
      'Please enter a password with only numbers and text and at least 5 characters' /* This is the default error msg for all validators*/
    )
      .isLength({ min: 5 /*, max: 10*/ })
      .isAlphanumeric()
      .trim() /* this is a sanitizer */,
    body('confirmPassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords have to match!');
        }
        return true;
      }
      )
  ],
  authController.postSignup);

router.post('/logout', authController.postLogout);

router.post('/reset', authController.postReset);

router.post('/new-password', authController.postNewPassword);


module.exports = router;