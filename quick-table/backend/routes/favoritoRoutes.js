const express = require('express');
const router = express.Router();
const autenticar = require('../middlewares/autenticar');
const { adicionarFavorito, removerFavorito, listarFavoritos } = require('../controllers/favoritoController');

router.post('/', autenticar, adicionarFavorito);
router.delete('/:restauranteId', autenticar, removerFavorito);
router.get('/', autenticar, listarFavoritos);

module.exports = router;
