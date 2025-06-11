// filepath: backend/routes/mesaRoutes.js
const express = require('express');
const {
    criarMesa,
    excluirMesa,
    listarMesas,
    listarMesasDisponiveis,
} = require('../controllers/mesaController');
const autenticar = require('../middlewares/autenticar');
const { verificarRestaurante } = require('../middlewares/autenticar');
const Mesa = require('../models/Mesa');
const router = express.Router();

// Rota para listar mesas
router.get('/', autenticar, verificarRestaurante, listarMesas);

// Rota para listar mesas disponíveis
router.get('/disponiveis', autenticar, listarMesasDisponiveis);

// Criar uma nova mesa
router.post('/', autenticar, verificarRestaurante, criarMesa);

// Excluir uma mesa
router.delete('/:id', autenticar, verificarRestaurante, excluirMesa);

// Rota para obter uma mesa específica
router.get('/:id', autenticar, verificarRestaurante, async (req, res) => {
    try {
        const { id } = req.params;
        const mesa = await Mesa.findByPk(id);

        if (!mesa) {
            return res.status(404).json({ erro: 'Mesa não encontrada.' });
        }

        res.json(mesa);
    } catch (error) {
        console.error('Erro ao buscar mesa:', error);
        res.status(500).json({ erro: 'Erro ao buscar mesa.' });
    }
});

// Rota para atualizar uma mesa
router.put('/:id', autenticar, verificarRestaurante, async (req, res) => {
    try {
        const { id } = req.params;
        const { numero, capacidade, descricao, disponivel } = req.body;

        const mesa = await Mesa.findByPk(id);

        if (!mesa) {
            return res.status(404).json({ erro: 'Mesa não encontrada.' });
        }

        await mesa.update({ numero, capacidade, descricao, disponivel });
        res.json({ mensagem: 'Mesa atualizada com sucesso!', mesa });
    } catch (error) {
        console.error('Erro ao atualizar mesa:', error);
        res.status(500).json({ erro: 'Erro ao atualizar mesa.' });
    }
});

module.exports = router;