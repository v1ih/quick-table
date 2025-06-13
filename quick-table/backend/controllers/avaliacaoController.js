const Avaliacao = require('../models/Avaliacao');
const Usuario = require('../models/Usuario');

exports.criarAvaliacao = async (req, res) => {
    try {
        const { nota, comentario, restauranteId, reservaId } = req.body;
        // Verifica se já existe avaliação para esta reserva
        const avaliacaoExistente = await Avaliacao.findOne({ where: { reservaId, usuarioId: req.usuario.id } });
        if (avaliacaoExistente) {
            return res.status(400).json({ erro: 'Você já avaliou esta reserva.' });
        }
        const avaliacao = await Avaliacao.create({
            nota,
            comentario,
            restauranteId,
            usuarioId: req.usuario.id,
            reservaId,
        });
        res.status(201).json(avaliacao);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

exports.obterAvaliacoes = async (req, res) => {
    try {
        const avaliacoes = await Avaliacao.findAll({
            where: { restauranteId: req.params.restauranteId },
            include: [{ model: Usuario, attributes: ['nome'] }],
        });
        res.json(avaliacoes);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

exports.obterAvaliacaoPorReserva = async (req, res) => {
    try {
        const { reservaId } = req.params;
        const avaliacao = await Avaliacao.findOne({
            where: { reservaId, usuarioId: req.usuario.id },
        });
        if (!avaliacao) {
            return res.status(404).json({ erro: 'Avaliação não encontrada para esta reserva.' });
        }
        res.json(avaliacao);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};