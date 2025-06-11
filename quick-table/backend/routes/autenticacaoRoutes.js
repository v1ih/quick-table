// filepath: backend/routes/authRoutes.js
const express = require('express');
const path = require('path');
const multer = require('multer');

const { registrar, login } = require('../controllers/autenticacaoController');
const { atualizarPerfil, deletarUsuario, atualizarFotoPerfil } = require('../controllers/usuarioController');
const autenticar = require('../middlewares/autenticar');

const router = express.Router();

// Configuração do multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Rotas de autenticação
router.post('/register', registrar);
router.post('/login', login);

// Rotas de perfil
router.put('/perfil', autenticar, atualizarPerfil);
router.delete('/perfil', autenticar, deletarUsuario);
router.post('/perfil/foto', autenticar, upload.single('fotoPerfil'), atualizarFotoPerfil);

module.exports = router;