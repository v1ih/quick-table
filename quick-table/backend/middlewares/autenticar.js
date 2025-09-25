const jwt = require('jsonwebtoken');
const Restaurante = require('../models/Restaurante');

module.exports = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ erro: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET); // Remove "Bearer"
        console.log('Token decodificado:', decoded);
        req.usuario = decoded; // Adiciona o usuário autenticado à requisição
        next();
    } catch (err) {
        res.status(401).json({ erro: 'Token inválido' });
    }
};

const verificarRestaurante = async (req, res, next) => {
    try {
        const usuarioId = req.usuario.id;
        console.log('Verificando restaurante para usuário:', usuarioId);
        const restaurante = await Restaurante.findOne({ where: { usuarioId } });

        if (!restaurante) {
            return res.status(403).json({ erro: 'O usuário não possui um restaurante.' });
        }

        req.restauranteId = restaurante.id; // Adiciona o restauranteId ao objeto req
        next();
    } catch (error) {
        console.error('Erro ao verificar restaurante:', error);
        res.status(500).json({ erro: 'Erro ao verificar restaurante.' });
    }
};

module.exports.verificarRestaurante = verificarRestaurante;