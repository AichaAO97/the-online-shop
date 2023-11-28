const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const User = require('./models/user');
const MONGODB_URL = require('./config');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');



app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


// all requests will have a user object
// this is a central place where we extract the user to be used anywhere in our app
app.use((req, res, next) => {
  User.findById("6560f86c10a2e14b5459cdee")
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.connect(MONGODB_URL)
  .then(result => {
    User.findOne().then(user => {
      if (!user) {  
        const user = User({
          name: 'Aicha',
          email: 'aicha@aao.com',
          cart: {items: []}
        });
        user.save();
      }
    });
    app.listen(3000);
    
  })
  .catch( err => console.log(err));
