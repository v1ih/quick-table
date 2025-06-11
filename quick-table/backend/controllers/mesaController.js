// filepath: backend/controllers/mesaController.js
const Mesa = require('../models/Mesa');

exports.criarMesa = async (req, res) => {
    try {
        const { numero, capacidade, disponivel, restauranteId, descricao } = req.body;
        const mesa = await Mesa.create({ numero, capacidade, disponivel, restauranteId, descricao });
        res.status(201).json(mesa);
    } catch (err) {
        res.status(400).json({ erro: err.message });
    }
};

exports.listarMesas = async (req, res) => {
    try {
        const restauranteId = req.query.restauranteId || req.restauranteId; // Prioriza o parâmetro de consulta, mas usa o ID do middleware se não estiver presente

        if (!restauranteId) {
            return res.status(400).json({ erro: 'O parâmetro restauranteId é obrigatório.' });
        }

        console.log('Listando mesas para restauranteId:', restauranteId);
        const mesas = await Mesa.findAll({ where: { restauranteId } });
        res.json(mesas);
    } catch (error) {
        console.error('Erro ao listar mesas:', error);
        res.status(500).json({ erro: 'Erro ao listar mesas.' });
    }
};

exports.obterMesaPorId = async (req, res) => {
    try {
        const mesa = await Mesa.findByPk(req.params.id);
        if (!mesa) return res.status(404).json({ erro: 'Mesa não encontrada' });
        res.json(mesa);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

exports.atualizarMesa = async (req, res) => {
    try {
        const mesa = await Mesa.findByPk(req.params.id);
        if (!mesa) return res.status(404).json({ erro: 'Mesa não encontrada' });

        await mesa.update(req.body);
        res.json(mesa);
    } catch (err) {
        res.status(400).json({ erro: err.message });
    }
};

exports.excluirMesa = async (req, res) => {
    try {
        const mesa = await Mesa.findByPk(req.params.id);
        if (!mesa) return res.status(404).json({ erro: 'Mesa não encontrada' });

        await mesa.destroy();
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

exports.listarMesasDisponiveis = async (req, res) => {
    try {
        const restauranteId = req.query.restauranteId;

        if (!restauranteId) {
            return res.status(400).json({ erro: 'O parâmetro restauranteId é obrigatório.' });
        }

        console.log('Listando mesas disponíveis para restauranteId:', restauranteId);
        const mesasDisponiveis = await Mesa.findAll({ where: { restauranteId, disponivel: true } });
        res.json(mesasDisponiveis);
    } catch (error) {
        console.error('Erro ao listar mesas disponíveis:', error);
        res.status(500).json({ erro: 'Erro ao listar mesas disponíveis.' });
    }
};