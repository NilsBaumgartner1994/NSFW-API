/**
 * A simple SequelizeHelper
 */
export default class SequelizeHelper {

    static getModelList(models){
        let modelJSON = models.sequelize.models;

        let exceptions = ["Login"];
        exceptions.forEach((exception => {
            delete modelJSON[exception];
        }));

        let modelNames = Object.keys(modelJSON); //get the names
        let modelList = [];
        for(let i=0; i<modelNames.length; i++) { //for every model
            let modelName = modelNames[i];
            let model = modelJSON[modelName];
            modelList.push(model);
        }
        return modelList;
    }

    static getModelTableNames(models){
        let tableNames = [];
        let modelList = SequelizeHelper.getModelList(models); //first get all models
        for(let i=0; i<modelList.length; i++) { //for every model
            let model = modelList[i];
            tableNames.push(SequelizeHelper.getTableName(model));
        }
        return tableNames;
    }

    static getTableName(model){
        return model.tableName;
    }

    static getPrimaryKeyAttributes(model){
        return model.primaryKeyAttributes;
    }

    static getModelAttributes(model){
        let rawAttributes = model.rawAttributes;
        let listAttributes = Object.keys(rawAttributes);
        listAttributes.forEach((attribute) => { //for every attribute
            //copy datatype again, since it somehow is shown but not over network
            rawAttributes[attribute].type["key"] = ""+rawAttributes[attribute].type.key;
        });
        return rawAttributes;
    }

    static getAssociationForModelJSON(model){
        const result = {};
        if (!model || typeof model.associations !== 'object') {
            throw new Error("Model should be an object with the 'associations' property.");
        }

        Object.keys(model.associations).forEach((key) => {
            const association = {};

            // all needed information in the 'options' object
            if (model.associations[key].hasOwnProperty('options')) {
                result[key] = model.associations[key];
                //console.log(model.associations[key]["options"]);
                //association[key] = model.associations[key].options;
            }
        });

        return result;
    }

}
