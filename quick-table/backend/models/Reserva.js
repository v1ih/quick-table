const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Mesa = require('./Mesa');

const Reserva = sequelize.define('Reserva', {
  dataHora: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pendente', 'confirmada', 'cancelada'),
    defaultValue: 'pendente',
  },
  numeroPessoas: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  observacao: {
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
  mesaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Mesa,
      key: 'id',
    },
  },
});

// Relacionamentos
Reserva.belongsTo(Usuario, { foreignKey: 'usuarioId', onDelete: 'CASCADE' });
Usuario.hasMany(Reserva, { foreignKey: 'usuarioId' });

Reserva.belongsTo(Mesa, { foreignKey: 'mesaId', onDelete: 'CASCADE' });
Mesa.hasMany(Reserva, { foreignKey: 'mesaId' });

module.exports = Reserva;