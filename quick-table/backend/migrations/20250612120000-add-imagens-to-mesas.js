'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Mesas', 'imagens', {
      type: Sequelize.JSON, // array de strings
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Mesas', 'imagens');
  },
};
