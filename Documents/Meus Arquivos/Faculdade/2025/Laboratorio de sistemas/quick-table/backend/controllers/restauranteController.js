const Restaurante = require('../models/Restaurante');

// Criar um novo restaurante
const criarRestaurante = async (req, res) => {
    try {
        const { nome, descricao, localizacao, telefone, horarioInicio, horarioFim } = req.body;
        const usuarioId = req.usuario.id; // ID do usuário autenticado

        // Verificar se o usuário já possui um restaurante
        const restauranteExistente = await Restaurante.findOne({ where: { usuarioId } });
        if (restauranteExistente) {
            return res.status(400).json({ erro: 'Você já possui um restaurante cadastrado. Não é possível cadastrar mais de um restaurante por usuário.' });
        }

        const restaurante = await Restaurante.create({
            nome,
            descricao,
            localizacao,
            telefone,
            horarioInicio,
            horarioFim,
            usuarioId,
        });

        res.status(201).json({ mensagem: 'Restaurante criado com sucesso!', restaurante });
    } catch (err) {
        console.error('Erro ao criar restaurante:', err);
        res.status(500).json({ erro: err.message });
    }
};

// Atualizar um restaurante existente
const atualizarRestaurante = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao, localizacao, telefone, horarioInicio, horarioFim } = req.body;

        const restaurante = await Restaurante.findByPk(id);
        if (!restaurante) {
            return res.status(404).json({ erro: 'Restaurante não encontrado' });
        }

        // Verificar se o restaurante pertence ao usuário autenticado
        if (restaurante.usuarioId !== req.usuario.id) {
            return res.status(403).json({ erro: 'Acesso negado' });
        }

        await restaurante.update({ nome, descricao, localizacao, telefone, horarioInicio, horarioFim });
        res.json({ mensagem: 'Restaurante atualizado com sucesso!', restaurante });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

// Excluir um restaurante
const excluirRestaurante = async (req, res) => {
    try {
        const { id } = req.params;

        const restaurante = await Restaurante.findByPk(id);
        if (!restaurante) {
            return res.status(404).json({ erro: 'Restaurante não encontrado' });
        }

        // Verificar se o restaurante pertence ao usuário autenticado
        if (restaurante.usuarioId !== req.usuario.id) {
            return res.status(403).json({ erro: 'Acesso negado' });
        }

        await restaurante.destroy();
        res.json({ mensagem: 'Restaurante excluído com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

// Função para cadastrar restaurante
const cadastrarRestaurante = async (req, res) => {
    const { nome, descricao, localizacao, telefone, horarioInicio, horarioFim } = req.body;

    if (!nome || !descricao || !localizacao || !telefone || !horarioInicio || !horarioFim) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
    }

    console.log('Recebendo dados para cadastro de restaurante:', req.body);

    try {
        const usuarioId = req.usuario.id; // ID do usuário autenticado

        const novoRestaurante = await Restaurante.create({
            nome,
            descricao,
            localizacao,
            telefone,
            horarioInicio,
            horarioFim,
            usuarioId,
        });
        res.status(201).json(novoRestaurante);
    } catch (error) {
        console.error('Erro ao cadastrar restaurante:', error);
        res.status(500).json({ erro: 'Erro ao cadastrar restaurante.' });
    }
};

// Obter restaurante do usuário autenticado
const obterRestauranteDoUsuario = async (req, res) => {
    try {
        const usuarioId = req.usuario.id; // ID do usuário autenticado
        const restaurante = await Restaurante.findOne({ where: { usuarioId } });

        if (!restaurante) {
            return res.status(404).json({ erro: 'Restaurante não encontrado para este usuário.' });
        }

        res.json(restaurante);
    } catch (error) {
        console.error('Erro ao obter restaurante do usuário:', error);
        res.status(500).json({ erro: 'Erro ao buscar restaurante do usuário.' });
    }
};

// Listar todos os restaurantes
const listarRestaurantes = async (req, res) => {
    try {
        const restaurantes = await Restaurante.findAll();
        res.json(restaurantes);
    } catch (error) {
        console.error('Erro ao listar restaurantes:', error);
        res.status(500).json({ erro: 'Erro ao listar restaurantes.' });
    }
};

// Obter os detalhes de um restaurante específico
const obterRestaurantePorId = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurante = await Restaurante.findByPk(id);

        if (!restaurante) {
            return res.status(404).json({ erro: 'Restaurante não encontrado.' });
        }

        res.json(restaurante);
    } catch (error) {
        console.error('Erro ao obter detalhes do restaurante:', error);
        res.status(500).json({ erro: 'Erro ao obter detalhes do restaurante.' });
    }
};

module.exports = {
    criarRestaurante,
    atualizarRestaurante,
    excluirRestaurante,
    cadastrarRestaurante,
    obterRestauranteDoUsuario,
    listarRestaurantes,
    obterRestaurantePorId,
};