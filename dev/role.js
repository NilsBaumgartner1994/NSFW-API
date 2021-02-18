'use strict';
/**
 * @api {MODEL} Role Role
 * @apiName ModelRole
 * @apiGroup 5Models
 *
 * @apiParam {Number} id Resource ID
 *
 * @apiParam {String} name The name of the role
 *
 * @apiParam {Date} [createdAt] The date the resource was created
 * @apiParam {Date} [updatedAt] The date the resource was updated
 *
 */
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    name: DataTypes.STRING
  }, {});
  Role.associate = function(models) {
    // associations can be defined here
    Role.belongsToMany(
        models.User,
        {
          through: models.UserRole,
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        }
    );
    Role.hasMany(
      models.UserRole,
    );
  };
  return Role;
};
