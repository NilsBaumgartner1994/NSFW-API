'use strict';
/**
 * TODO API Doc when finished
 */
module.exports = (sequelize, DataTypes) => {
  const Examtask = sequelize.define('Examtask', {
    name: {type: DataTypes.STRING, allowNull: false}, //required
      points: {type: DataTypes.INTEGER, allowNull: false}, //required
      position: {type: DataTypes.INTEGER, allowNull: true},
  }, {});
    Examtask.associate = function(models) {
    // associations can be defined here
        Examtask.belongsTo(
        models.Exam,
            {
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            }
    );
  };
  return Examtask;
};
