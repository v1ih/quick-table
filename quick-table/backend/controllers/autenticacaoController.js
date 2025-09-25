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
        res.json({ 
            mensagem: 'Login realizado com sucesso!', 
            token, 
            tipo: usuario.tipo, 
            nome: usuario.nome, 
            email: usuario.email, 
            telefone: usuario.telefone,
            fotoPerfil: usuario.fotoPerfil || null // Adiciona o campo fotoPerfil
        });
    } catch (err) {
        res.status(500).json({ erro: 'Erro no servidor: ' + err.message });
    }
};

exports.atualizarPerfil = async (req, res) => {
    const { nome, email, telefone, fotoPerfil } = req.body;
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
        if (fotoPerfil !== undefined) {
            usuario.fotoPerfil = fotoPerfil || null;
        }

        await usuario.save();

        res.json({ mensagem: 'Perfil atualizado com sucesso!', usuario });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar o perfil: ' + error.message });
    }
};

// Recuperação de senha - simulação de token, alteração real de senha
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ erro: 'E-mail é obrigatório.' });

    try {
        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario) {
            return res.status(404).json({ erro: 'E-mail não cadastrado.' });
        }
        // Simula o envio de e-mail com token
        return res.status(200).json({ mensagem: 'Instruções para redefinir sua senha foram enviadas para o e-mail informado.' });
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao processar solicitação.' });
    }
};

// Redefinição de senha - simulação de token, alteração real de senha
exports.resetPassword = async (req, res) => {
    const { email, token, senha } = req.body;
    if (!email || !token || !senha) return res.status(400).json({ erro: 'Dados obrigatórios faltando.' });
    try {
        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });
        usuario.senha = await bcrypt.hash(senha, 10);
        usuario.resetToken = null;
        usuario.resetTokenExpira = null;
        await usuario.save();
        return res.status(200).json({ mensagem: 'Senha redefinida com sucesso!' });
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao redefinir senha.' });
    }
};