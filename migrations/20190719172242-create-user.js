'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      pseudonym: {
        type: Sequelize.STRING
      },
      avatar: {
        type: Sequelize.JSON
      },
      onlineTime: {
        type: Sequelize.DATE
      },
      privacyPolicyReadDate: {
        allowNull: false,
        type:Sequelize.DATE,
        defaultValue: new Date()
      },
      language: {
        type:Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date()
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date()
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users');
  }
};