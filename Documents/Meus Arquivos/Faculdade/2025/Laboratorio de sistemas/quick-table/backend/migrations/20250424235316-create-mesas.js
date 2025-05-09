'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Mesas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      numero: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      capacidade: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      disponivel: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      restauranteId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Restaurantes',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Mesas');
  },
};
