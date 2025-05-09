const express = require('express');
const {
    criarAvaliacao,
    obterAvaliacoes,
} = require('../controllers/avaliacaoController');
const autenticar = require('../middlewares/autenticar');
const router = express.Router();

router.post('/', autenticar, criarAvaliacao); // Criar uma avaliação
router.get('/:restauranteId', obterAvaliacoes); // Obter avaliações de um restaurante

module.exports = router;