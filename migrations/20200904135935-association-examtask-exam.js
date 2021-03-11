'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
        'Examtasks', // name of Source model
        'ExamId', // name of the key we're adding
        {
          type: Sequelize.INTEGER,
          references: {
            model: 'Exams', // name of Target model
            key: 'id', // key in Target model that we're referencing
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
        'Examtasks', // name of Source model
        'ExamId' // key we want to remove
    );
  }
};
