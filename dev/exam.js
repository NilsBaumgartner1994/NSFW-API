'use strict';
/**
 * TODO API Doc when finished
 */
module.exports = (sequelize, DataTypes) => {
  const Exam = sequelize.define('Exam', {
    name: {type: DataTypes.STRING, allowNull: false}, //required
    year: {type: DataTypes.STRING, allowNull: false}, //required

    startDate: {type: DataTypes.DATE, allowNull: false}, //required
    endDate: {type: DataTypes.DATE, allowNull: false}, //required

    examtaskvariations: {type: DataTypes.JSON, allowNull: true},
    evaluationActive: {type: DataTypes.BOOLEAN, allowNull: true},
  }, {});
  Exam.associate = function(models) {
    // associations can be defined here
      Exam.hasMany(
          models.Examtask,
      );
  };
  return Exam;
};
