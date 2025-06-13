const Restaurante = require('../models/Restaurante');
const Reserva = require('../models/Reserva');
const Mesa = require('../models/Mesa');
const Usuario = require('../models/Usuario');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB por imagem
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Apenas arquivos de imagem são permitidos!'));
    }
});

// Criar um novo restaurante com upload de imagens
const criarRestaurante = async (req, res) => {
    try {
        const { nome, descricao, localizacao, telefone, horarioInicio, horarioFim } = req.body;
        const usuarioId = req.usuario.id;

        // Verificar se o usuário já possui um restaurante
        const restauranteExistente = await Restaurante.findOne({ where: { usuarioId } });
        if (restauranteExistente) {
            return res.status(400).json({ erro: 'Você já possui um restaurante cadastrado. Não é possível cadastrar mais de um restaurante por usuário.' });
        }

        // Lida com imagens
        let imagens = [];
        if (req.files && req.files.length > 0) {
            imagens = req.files.map(file => `/uploads/${file.filename}`);
        }

        const restaurante = await Restaurante.create({
            nome,
            descricao,
            localizacao,
            telefone,
            horarioInicio,
            horarioFim,
            usuarioId,
            imagens,
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
        const { nome, descricao, localizacao, telefone, horarioInicio, horarioFim, imagens: imagensExistentes } = req.body;
        const restaurante = await Restaurante.findByPk(id);
        if (!restaurante) {
            return res.status(404).json({ erro: 'Restaurante não encontrado' });
        }
        if (restaurante.usuarioId !== req.usuario.id) {
            return res.status(403).json({ erro: 'Acesso negado' });
        }
        // Lógica de imagens: mantém as existentes, adiciona novas
        let imagens = [];
        // Imagens já existentes (enviadas como string no body)
        if (imagensExistentes) {
            if (typeof imagensExistentes === 'string') {
                // Se vier como string única
                imagens = [imagensExistentes];
            } else if (Array.isArray(imagensExistentes)) {
                imagens = imagensExistentes;
            }
        } else if (restaurante.imagens) {
            imagens = restaurante.imagens;
        }
        // Novos arquivos enviados
        if (req.files && req.files.length > 0) {
            imagens = imagens.concat(req.files.map(file => `/uploads/${file.filename}`));
        }
        // Limita a 6 imagens
        imagens = imagens.slice(0, 6);
        await restaurante.update({ nome, descricao, localizacao, telefone, horarioInicio, horarioFim, imagens });
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

// Listar reservas do restaurante autenticado
const listarReservasDoRestaurante = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        // Busca o restaurante do usuário autenticado
        const restaurante = await Restaurante.findOne({ where: { usuarioId } });
        console.log('Restaurante encontrado:', restaurante ? restaurante.id : null);
        if (!restaurante) {
            console.log('Restaurante não encontrado para usuário:', usuarioId);
            return res.status(404).json({ erro: 'Restaurante não encontrado para este usuário.' });
        }
        // Busca todas as mesas do restaurante
        const mesas = await Mesa.findAll({ where: { restauranteId: restaurante.id } });
        const mesaIds = mesas.map(m => m.id);
        console.log('Mesas encontradas:', mesaIds);
        if (mesaIds.length === 0) {
            console.log('Nenhuma mesa encontrada para o restaurante.');
            return res.json([]); // Nenhuma mesa, retorna lista vazia
        }
        // Busca todas as reservas dessas mesas, incluindo dados do cliente e da mesa
        const reservas = await Reserva.findAll({
            where: { mesaId: mesaIds },
            include: [
                { model: Usuario, as: 'Usuario', attributes: ['nome', 'telefone'] },
                { model: Mesa, as: 'Mesa', attributes: ['numero', 'descricao'] },
            ],
            order: [['dataHora', 'DESC']],
        });
        console.log('Reservas encontradas:', reservas.length);
        // Formata para frontend
        const reservasFormatadas = reservas.map(r => ({
            id: r.id,
            dataHora: r.dataHora,
            status: r.status,
            numeroPessoas: r.numeroPessoas,
            usuario: r.Usuario ? { nome: r.Usuario.nome, telefone: r.Usuario.telefone } : undefined,
            mesa: r.Mesa ? { numero: r.Mesa.numero, descricao: r.Mesa.descricao } : undefined,
        }));
        res.json(reservasFormatadas);
    } catch (error) {
        console.error('Erro ao listar reservas do restaurante:', error);
        res.status(500).json({ erro: 'Erro ao listar reservas do restaurante.', detalhe: error.message });
    }
};

// Atualizar status de uma reserva (restaurante)
const atualizarStatusReservaRestaurante = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const { id } = req.params;
        const { status } = req.body;
        // Busca o restaurante do usuário autenticado
        const restaurante = await Restaurante.findOne({ where: { usuarioId } });
        if (!restaurante) {
            return res.status(404).json({ erro: 'Restaurante não encontrado para este usuário.' });
        }
        // Busca a reserva e garante que pertence a uma mesa do restaurante
        const reserva = await Reserva.findByPk(id, {
            include: [{ model: Mesa, as: 'Mesa', attributes: ['id', 'restauranteId'] }]
        });
        if (!reserva || !reserva.Mesa || reserva.Mesa.restauranteId !== restaurante.id) {
            return res.status(404).json({ erro: 'Reserva não encontrada para este restaurante.' });
        }
        // Só permite status válidos
        const statusValidos = ['pendente', 'confirmada', 'cancelada', 'concluida'];
        if (!statusValidos.includes(status)) {
            return res.status(400).json({ erro: 'Status inválido.' });
        }
        await reserva.update({ status });
        res.json({ mensagem: 'Status da reserva atualizado com sucesso.', reserva });
    } catch (error) {
        console.error('Erro ao atualizar status da reserva:', error);
        res.status(500).json({ erro: 'Erro ao atualizar status da reserva.' });
    }
};

// Exportar o upload para uso na rota
module.exports = {
    criarRestaurante,
    atualizarRestaurante,
    excluirRestaurante,
    cadastrarRestaurante,
    obterRestauranteDoUsuario,
    listarRestaurantes,
    obterRestaurantePorId,
    upload,
    listarReservasDoRestaurante,
    atualizarStatusReservaRestaurante,
};