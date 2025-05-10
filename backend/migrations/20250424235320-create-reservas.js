'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Reservas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      dataHora: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pendente', 'confirmada', 'cancelada'),
        defaultValue: 'pendente',
      },
      numeroPessoas: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      observacao: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Usuarios',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      mesaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Mesas',
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
    await queryInterface.dropTable('Reservas');
  },
};
