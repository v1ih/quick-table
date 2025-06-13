const express = require('express');
const {
    criarAvaliacao,
    obterAvaliacoes,
    obterAvaliacaoPorReserva,
} = require('../controllers/avaliacaoController');
const autenticar = require('../middlewares/autenticar');
const router = express.Router();

router.post('/', autenticar, criarAvaliacao); // Criar uma avaliação
router.get('/:restauranteId', obterAvaliacoes); // Obter avaliações de um restaurante
router.get('/by-reserva/:reservaId', autenticar, obterAvaliacaoPorReserva); // Obter avaliação de uma reserva específica

module.exports = router;