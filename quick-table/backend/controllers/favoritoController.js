const Favorito = require('../models/Favorito');
const Restaurante = require('../models/Restaurante');
const Avaliacao = require('../models/Avaliacao');
const { fn, col } = require('sequelize');

exports.adicionarFavorito = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const { restauranteId } = req.body;
        if (!restauranteId) return res.status(400).json({ erro: 'restauranteId é obrigatório' });

        const existente = await Favorito.findOne({ where: { usuarioId, restauranteId } });
        if (existente) return res.status(400).json({ erro: 'Já favoritado' });

        const favorito = await Favorito.create({ usuarioId, restauranteId });
        res.status(201).json({ mensagem: 'Favorito adicionado', favorito });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: err.message });
    }
};

exports.removerFavorito = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const { restauranteId } = req.params;
        const favorito = await Favorito.findOne({ where: { usuarioId, restauranteId } });
        if (!favorito) return res.status(404).json({ erro: 'Favorito não encontrado' });
        await favorito.destroy();
        res.json({ mensagem: 'Favorito removido' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: err.message });
    }
};

// Retorna lista de restaurantes favoritados pelo usuário
exports.listarFavoritos = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        // Buscar restaurantes favoritados pelo usuário e incluir nota média (AVG)
        const restaurantes = await Restaurante.findAll({
            include: [
                { model: Favorito, where: { usuarioId }, attributes: [] },
                { model: Avaliacao, attributes: [] },
            ],
            attributes: {
                include: [[fn('AVG', col('Avaliacaos.nota')), 'notaMedia']]
            },
            group: ['Restaurante.id'],
        });
        res.json(restaurantes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: err.message });
    }
};
