const Avaliacao = require('../models/Avaliacao');

exports.criarAvaliacao = async (req, res) => {
    try {
        const { nota, comentario, restauranteId } = req.body;
        const avaliacao = await Avaliacao.create({
            nota,
            comentario,
            restauranteId,
            usuarioId: req.usuario.id,
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
        });
        res.json(avaliacoes);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};