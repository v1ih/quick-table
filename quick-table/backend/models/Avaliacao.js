const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Restaurante = require('./Restaurante');

const Avaliacao = sequelize.define('Avaliacao', {
  nota: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  comentario: {
    type: DataTypes.TEXT,
    allowNull: true, // Opcional
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: 'id',
    },
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

// Relacionamentos
Avaliacao.belongsTo(Usuario, { foreignKey: 'usuarioId', onDelete: 'CASCADE' });
Usuario.hasMany(Avaliacao, { foreignKey: 'usuarioId' });

Avaliacao.belongsTo(Restaurante, { foreignKey: 'restauranteId', onDelete: 'CASCADE' });
Restaurante.hasMany(Avaliacao, { foreignKey: 'restauranteId' });

module.exports = Avaliacao;