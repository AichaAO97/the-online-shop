const Product = require('../models/product');
const Order = require('../models/order');

// this is fixed
exports.getProducts = (req, res, next) => {
  Product.find().then(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  }).catch(err => console.log(err));

};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(
      (product) => {
        res.render('shop/product-detail', {
          product: product,
          pageTitle: product.title,
          path: '/products'
        });
        
      }
    )
    .catch(err => {
      console.log(err);
    });

}

//this is fixed 
exports.getIndex = (req, res, next) => {
  Product.find().then(products => {
    res.render('shop/index', {
      prods: products,
      path: '/',
      pageTitle: 'Shop',
    });
  }).catch(err => console.log(err));
  
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err => {
      console.log(err);
    });
};

//this works now because we added addToCart method to User model
exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    });
};


exports.postCartDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  req.user.deleteItemFromCart(productId)
    .then((result)=> {
      res.redirect('/cart');
    })
    .catch(err => {
      console.log(err);
    });
}


exports.postOrder = (req, res, next) => {

  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items.map(item => {
        return {product: {...item.productId._doc}, quantity: item.quantity};
        // if I get product this way => product: {...item.productId}
        // I still can access all product details but without userId
      }); 
      const order = new Order({
        products: products,
        user: {name: req.user.name, userId: req.user._id}
      });
      return order.save();
    })
    .then((result) => {
      req.user.clearCart();
    }).then(()=> {
      res.redirect('/orders');
    })
    .catch(err => console.log(err));
}


exports.getOrders = (req, res, next) => {
  Order.find({'user.userId': req.user._id})
    .then(orders => {
    console.log({orders});
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders: orders
    });
    })
    .catch(err => console.log(err));
};
