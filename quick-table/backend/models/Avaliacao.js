const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Restaurante = require('./Restaurante');
const Reserva = require('./Reserva');

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
  reservaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // Garante uma avaliação por reserva
  },
});

// Relacionamentos
Avaliacao.belongsTo(Usuario, { foreignKey: 'usuarioId', onDelete: 'CASCADE' });
Usuario.hasMany(Avaliacao, { foreignKey: 'usuarioId' });

Avaliacao.belongsTo(Restaurante, { foreignKey: 'restauranteId', onDelete: 'CASCADE' });
Restaurante.hasMany(Avaliacao, { foreignKey: 'restauranteId' });

// Relacionamento com Reserva
Avaliacao.belongsTo(Reserva, { foreignKey: 'reservaId', onDelete: 'CASCADE' });
Reserva.hasOne(Avaliacao, { foreignKey: 'reservaId' });

module.exports = Avaliacao;