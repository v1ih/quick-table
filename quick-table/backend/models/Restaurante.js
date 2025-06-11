// filepath: backend/models/Restaurante.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');

const Restaurante = sequelize.define('Restaurante', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    descricao: {
        type: DataTypes.TEXT,
        allowNull: true, // Opcional
    },
    localizacao: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    telefone: {
        type: DataTypes.STRING,
        allowNull: true, // Opcional
    },
    horarioInicio: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    horarioFim: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Usuario,
            key: 'id',
        },
    },
});

// Relacionamento: Um restaurante pertence a um usuário
Restaurante.belongsTo(Usuario, { foreignKey: 'usuarioId', onDelete: 'CASCADE' });
Usuario.hasOne(Restaurante, { foreignKey: 'usuarioId' });

module.exports = Restaurante;