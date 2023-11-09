const { query } = require('express');
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  // before adding the one-to-many relationship, we created the product
  // using Product.create() without adding userId field. Now, because we have
  //the one-to-many relationship we can either use Product.create() and 
  // add userId field or use the req.user.createProduct method provided by 
  // sequelize
  
  req.user
    .createProduct({
      title: title,
      price: price,
      imageUrl: imageUrl,
      description: description
    })
/*  Product.create({
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description,
    userId: req.user.id
  })*/.then(result => {
    console.log('Created product');
    res.redirect('/admin/products');
  }).catch(err => {
    console.log(err);
  });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit ; 
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;

  //after adding the one-to-many relationship
  req.user
    .getProducts({where: {id: prodId}})
    .then(prod => {
      const product = prod[0];
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product
      })
    })
    .catch(err => {
      console.log(err);
    });



  // Before adding the one-to-many relationship
  /*
  Product.findByPk(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product
      });
    })
    .catch(err => {
    console.log(err);
  });
  */
};



exports.postEditProduct = (req, res, next) => {

  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImageUrl = req.body.imageUrl;
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.description;
  
  Product.findByPk(prodId).then(product => {
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.imageUrl = updatedImageUrl;
    product.description = updatedDesc;
    return product.save();
  })
  .then(result => {
    console.log("UPDATED PRODUCT");
    res.redirect('/admin/products');
  })
  .catch(err => {
    console.log(err);
  });

};

exports.getProducts = (req, res, next) => {

  // Product.findAll()    #### Before the one-to-many relationship
  //after one to many relationship
  req.user.getProducts()
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => {
      console.log(err);
    });
};
exports.postDeleteProduct = (req, res, next) => {

  const productId = req.body.productId;
  Product.findByPk(productId).then(product => {
    return product.destroy();
  }).then( result => {
    console.log("DESTROYED PRODUCT");
    res.redirect('/admin/products');
  }).catch(err => console.log(err));

};