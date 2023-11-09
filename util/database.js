/***  using Sequelize ***/

const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-complete', 'root', 'admin', {dialect: 'mysql', host: 'localhost'});

module.exports = sequelize;
























/*** Before using Sequelize ***/

// const mysql = require('mysql2');

// const pool = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   database: 'node-complete',
//   password: 'admin'
// });

// module.exports = pool.promise();



