'use strict';
/**
 * @apiDefine UserRole UserRole
 * User's can have different Roles. This association is represented by the table UserRoles.
 */

/**
 * @api {MODEL} UserRole UserRole
 * @apiName ModelUserRole
 * @apiGroup 5Models
 *
 * @apiParam {Number} UserId [UserId](#api-1._Models-ModelUser)'s Id
 * @apiParam {Number} RoleId [Role](#api-1._Models-ModelRole)'s Id
 *
 * @apiParam {String} [beginnAt] The date the authorization is starting
 * @apiParam {JSON} [endAt] The date the authorization will expired
 *
 * @apiParam {Date} [createdAt] The date the resource was created
 * @apiParam {Date} [updatedAt] The date the resource was updated
 *
 */
module.exports = (sequelize, DataTypes) => {
  const UserRole = sequelize.define('UserRole', {
      beginnAt: DataTypes.DATE,
      endAt: DataTypes.DATE,
  }, {});
    UserRole.associate = function(models) {
        // associations can be defined here

        UserRole.belongsTo(
            models.User,
        );
        UserRole.belongsTo(
            models.Role,
        );
    };
  return UserRole;
};
