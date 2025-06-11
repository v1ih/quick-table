// filepath: backend/controllers/autenticacaoController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario'); // Modelo de usuário

exports.registrar = async (req, res) => {
    console.log('Dados recebidos no backend:', req.body); // Adicione este log
    const { nome, email, senha, tipo } = req.body;
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    try {
        // Verificar se o e-mail já está cadastrado
        const usuarioExistente = await Usuario.findOne({ where: { email } });
        if (usuarioExistente) {
            return res.status(400).json({ erro: 'E-mail já está cadastrado.' });
        }

        const usuario = await Usuario.create({
            nome,
            email,
            senha: senhaCriptografada,
            tipo,
        });
        res.status(201).json({ mensagem: 'Usuário registrado com sucesso!', usuario });
    } catch (err) {
        if (err.name === 'SequelizeValidationError') {
            const mensagensErro = err.errors.map((e) => e.message);
            return res.status(400).json({ erro: `Erro de validação: ${mensagensErro.join(', ')}` });
        }

        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ erro: 'E-mail já está cadastrado. Por favor, use outro e-mail.' });
        }

        res.status(400).json({ erro: 'Erro ao registrar usuário: ' + err.message });
    }
};

exports.login = async (req, res) => {
    const { email, senha } = req.body;

    try {
        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) return res.status(401).json({ erro: 'Credenciais inválidas' });

        const token = jwt.sign({ id: usuario.id, tipo: usuario.tipo }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ mensagem: 'Login realizado com sucesso!', token, tipo: usuario.tipo, nome: usuario.nome, email: usuario.email });
    } catch (err) {
        res.status(500).json({ erro: 'Erro no servidor: ' + err.message });
    }
};

exports.atualizarPerfil = async (req, res) => {
    const { nome, email, telefone } = req.body;
    const { id } = req.usuario; // ID do usuário autenticado (via middleware de autenticação)

    try {
        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ erro: 'Usuário não encontrado.' });
        }

        // Atualizar os campos fornecidos
        usuario.nome = nome || usuario.nome;
        usuario.email = email || usuario.email;
        usuario.telefone = telefone || usuario.telefone;

        await usuario.save();

        res.json({ mensagem: 'Perfil atualizado com sucesso!', usuario });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar o perfil: ' + error.message });
    }
};