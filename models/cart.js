const fs = require('fs');
const path = require('path');

const rootDir = require('../util/path');


const pathToFile = path.join(rootDir, 'data', 'cart.json');

module.exports = class Cart {

  static addProduct(id, productPrice) {
  // 1- Fetch the previous cart
    
    fs.readFile(pathToFile , (err, fileContent) => {
      let cart = {products: [], totalPrice: 0};
      if (!err) {
        cart = JSON.parse(fileContent);
      }
  // 2- Analyse the cart => find existing product
      const existingProductIndex = cart.products.findIndex(product => product.id === id);  
      const existingProduct = cart.products[existingProductIndex];
  // 3- Add new product if doesn't exist or increase quantity if it does
      let updatedProduct;
      if (existingProduct) {
        updatedProduct = {...existingProduct};
        updatedProduct.qty = updatedProduct.qty + 1;
        // He added this following line, but I can't see its utility 
        // cart.products = [...cart.products];
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = {id: id, qty: 1 };
        cart.products = [...cart.products, updatedProduct]
      }
      cart.totalPrice = cart.totalPrice + +productPrice;
      fs.writeFile(pathToFile, JSON.stringify(cart), (err) => {
        console.log(err);
      });
    });
  }
}