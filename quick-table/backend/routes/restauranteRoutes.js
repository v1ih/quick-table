const express = require('express');
const { criarRestaurante, atualizarRestaurante, excluirRestaurante, cadastrarRestaurante, obterRestauranteDoUsuario, listarRestaurantes, obterRestaurantePorId, upload, listarReservasDoRestaurante, atualizarStatusReservaRestaurante } = require('../controllers/restauranteController');
const autenticar = require('../middlewares/autenticar');
const router = express.Router();

// Rota para criar um restaurante com upload de imagens
router.post('/', autenticar, upload.array('imagens', 6), criarRestaurante);

// Rota para atualizar um restaurante
router.put('/:id', autenticar, upload.array('imagens', 6), atualizarRestaurante);

// Rota para excluir um restaurante
router.delete('/:id', autenticar, excluirRestaurante);

// Rota para cadastro de restaurante
router.post('/cadastro', cadastrarRestaurante);

// Rota para obter os dados do restaurante do usuário autenticado
router.get('/me', autenticar, obterRestauranteDoUsuario);

// Rota para listar todos os restaurantes
router.get('/', listarRestaurantes);

// Rota para listar reservas do restaurante autenticado
router.get('/reservas', autenticar, listarReservasDoRestaurante);

// Rota para atualizar status de uma reserva do restaurante
router.patch('/reservas/:id/status', autenticar, atualizarStatusReservaRestaurante);

// Rota para obter os detalhes de um restaurante específico
router.get('/:id', obterRestaurantePorId);

module.exports = router;