'use strict';
/**
 * @apiDefine 5Models 5. Models
 * All models are listed below. All models got a Field "createdAt" and "updatedAt", these Fields update automatically, dont change them unless you realy need it !
 */
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

var currentPath = process.cwd();
__dirname = currentPath+"/models"; //__dirname
__filename = __dirname+"/index.js"; //__filename

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize = new Sequelize(config.database, config.username, config.password, config);

fs
  .readdirSync(__dirname)
  .filter(file => {
    //console.log(file);
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    //console.log("Associate to DB: "+modelName);
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
