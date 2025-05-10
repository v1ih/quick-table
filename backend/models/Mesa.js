// filepath: backend/models/Mesa.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Restaurante = require('./Restaurante');

const Mesa = sequelize.define('Mesa', {
  numero: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  capacidade: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  disponivel: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true, // Opcional
  },
  restauranteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Restaurante,
      key: 'id',
    },
  },
});

// Relacionamento: Uma mesa pertence a um restaurante
Mesa.belongsTo(Restaurante, { foreignKey: 'restauranteId', onDelete: 'CASCADE' });
Restaurante.hasMany(Mesa, { foreignKey: 'restauranteId' });



module.exports = Mesa;module.exports = Mesa;