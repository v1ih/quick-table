// Migration para adicionar resetToken e resetTokenExpira ao Usuario
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Já existe no banco, não faz nada para evitar erro de duplicidade
    // await queryInterface.addColumn('Usuarios', 'resetToken', {
    //   type: Sequelize.STRING,
    //   allowNull: true,
    // });
    // await queryInterface.addColumn('Usuarios', 'resetTokenExpira', {
    //   type: Sequelize.BIGINT,
    //   allowNull: true,
    // });
  },

  down: async (queryInterface, Sequelize) => {
    // await queryInterface.removeColumn('Usuarios', 'resetToken');
    // await queryInterface.removeColumn('Usuarios', 'resetTokenExpira');
  }
};
