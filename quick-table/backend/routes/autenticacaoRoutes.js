// filepath: backend/routes/authRoutes.js
const express = require('express');
const { registrar, login } = require('../controllers/autenticacaoController');
const { atualizarPerfil, deletarUsuario } = require('../controllers/usuarioController');
const autenticar = require('../middlewares/autenticar'); // Middleware para autenticação
const router = express.Router();

router.post('/register', registrar);
router.post('/login', login);
router.put('/perfil', autenticar, atualizarPerfil); // Atualizar perfil
router.delete('/perfil', autenticar, deletarUsuario); // Excluir usuário

module.exports = router;