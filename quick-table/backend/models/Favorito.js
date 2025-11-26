const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Restaurante = require('./Restaurante');

const Favorito = sequelize.define('Favorito', {
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

Favorito.belongsTo(Usuario, { foreignKey: 'usuarioId', onDelete: 'CASCADE' });
Usuario.hasMany(Favorito, { foreignKey: 'usuarioId' });

Favorito.belongsTo(Restaurante, { foreignKey: 'restauranteId', onDelete: 'CASCADE' });
Restaurante.hasMany(Favorito, { foreignKey: 'restauranteId' });

module.exports = Favorito;
