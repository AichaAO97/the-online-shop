const { validationResult } = require('express-validator');

const Product = require('../models/product');

// this works
exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

// this is fixed
exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing: false,
      hasError: true,
      product: {
        title, imageUrl, price, description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const product = new Product({ title, price, description, imageUrl, userId: req.user }); // or userId: req.user._id

  product.save()
    .then(result => {
      console.log('Created product');
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
    });
};

// this works as it is thanks to God, then to mongoose
exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors: []
      })
    })
    .catch(err => {
      console.log(err);
    });
};


// this is fixed
exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImageUrl = req.body.imageUrl;
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.description;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle, imageUrl: updatedImageUrl, price: updatedPrice, description: updatedDesc, _id: prodId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()


    });
  }


  Product.findById(prodId)
    .then(product => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.imageUrl = updatedImageUrl;
      product.description = updatedDesc;
      return product.save()
        .then(result => {
          console.log("UPDATED PRODUCT");
          res.redirect('/admin/products');
        });
    })
    .catch(err => {
      console.log(err);
    });

};

//this is fixed
exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
      });
    })
    .catch(err => {
      console.log(err);
    });
};

//this is fixed
exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.deleteOne({ _id: productId, userId: req.user._id })
    .then((result) => {
      console.log("DESTROYED PRODUCT");
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
};