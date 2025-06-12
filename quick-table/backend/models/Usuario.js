const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    telefone: {
        type: DataTypes.STRING,
        allowNull: true, // Opcional
    },
    tipo: {
        type: DataTypes.ENUM('cliente', 'restaurante'),
        allowNull: false,
    },
    fotoPerfil: {
        type: DataTypes.STRING,
        allowNull: true, // Opcional
    },
    resetToken: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    resetTokenExpira: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
});

module.exports = Usuario;