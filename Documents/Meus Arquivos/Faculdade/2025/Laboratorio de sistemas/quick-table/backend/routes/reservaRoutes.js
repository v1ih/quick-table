const express = require('express');
const {
    criarReserva,
    obterReservas,
    cancelarReserva,
} = require('../controllers/reservaController');
const autenticar = require('../middlewares/autenticar'); // Middleware de autenticação
const router = express.Router();

router.post('/', autenticar, criarReserva); // Criar uma reserva
router.get('/', autenticar, obterReservas); // Obter reservas do usuário
router.delete('/:id', autenticar, cancelarReserva); // Cancelar uma reserva

module.exports = router;