import ServerAPI from "../ServerAPI";

const Sequelize = require('sequelize');
const path = require('path');
const fs = require('fs');

/**
 * A simple SequelizeHelper
 */
export default class SequelizeModelLoader {

    static _getSequelizeInstance(sequelizeConfig){
        if(!!sequelizeConfig){
            return new Sequelize(sequelizeConfig.database, sequelizeConfig.username, sequelizeConfig.password, sequelizeConfig);
        } else {
            console.log("WARNING ! NO SEQUELIZE CONFIG OR PATH TO MODELS FOUND !");
            console.log("USING NOT PERSISTENT IN MEMORY DATABASE !")
            return new Sequelize('sqlite::memory:');
        }
    }

    static async loadModelsInstance(sequelizeConfig, pathToModels){
        const db = {};

        let sequelize = SequelizeModelLoader._getSequelizeInstance(sequelizeConfig);

        if(!!pathToModels){
            let modelEnding = ".js";
            let modelEndingLength = modelEnding.length;
            fs
                .readdirSync(pathToModels)
                .filter(file => {
                    return (file.indexOf('.') !== 0) && (file.slice(-modelEndingLength) === modelEnding);
                })
                .forEach(file => {
                    const model = sequelize['import'](path.join(pathToModels, file));
                    db[model.name] = model;
                });

            Object.keys(db).forEach(modelName => {
                if (db[modelName].associate) {
                    //console.log("Associate to DB: "+modelName);
                    db[modelName].associate(db);
                }
            });
        }

        if(!sequelizeConfig){ //if using sqlite::memory database
            //we cant loose any data
            await sequelize.sync({force: true}); //we should create the tables by given models
        }

        db.sequelize = sequelize;
        db.Sequelize = Sequelize;

        return db;
    }

}
