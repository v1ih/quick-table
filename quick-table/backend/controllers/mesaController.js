// filepath: backend/controllers/mesaController.js
const Mesa = require('../models/Mesa');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configuração do multer para upload de imagens de mesa
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

exports.uploadMesaImages = upload.array('imagens', 3);

exports.criarMesa = async (req, res) => {
    try {
        let { numero, capacidade, disponivel, restauranteId, descricao } = req.body;
        // Se vier como string, converte para número
        numero = Number(numero);
        capacidade = Number(capacidade);
        disponivel = disponivel === 'false' ? false : !!disponivel;
        let imagens = [];
        if (req.files && req.files.length > 0) {
            imagens = req.files.map(file => `/uploads/${file.filename}`);
        }
        // Se imagens vierem como string (já existentes)
        if (req.body.imagens && typeof req.body.imagens === 'string') {
            try {
                const imgs = JSON.parse(req.body.imagens);
                if (Array.isArray(imgs)) imagens = imagens.concat(imgs);
            } catch {}
        }
        imagens = imagens.slice(0, 3);
        const mesa = await Mesa.create({ numero, capacidade, disponivel, restauranteId, descricao, imagens });
        res.status(201).json(mesa);
    } catch (err) {
        res.status(400).json({ erro: err.message });
    }
};

exports.listarMesas = async (req, res) => {
    try {
        const restauranteId = req.query.restauranteId || req.restauranteId; // Prioriza o parâmetro de consulta, mas usa o ID do middleware se não estiver presente

        if (!restauranteId) {
            return res.status(400).json({ erro: 'O parâmetro restauranteId é obrigatório.' });
        }

        console.log('Listando mesas para restauranteId:', restauranteId);
        const mesas = await Mesa.findAll({ where: { restauranteId } });
        res.json(mesas);
    } catch (error) {
        console.error('Erro ao listar mesas:', error);
        res.status(500).json({ erro: 'Erro ao listar mesas.' });
    }
};

exports.obterMesaPorId = async (req, res) => {
    try {
        const mesa = await Mesa.findByPk(req.params.id);
        if (!mesa) return res.status(404).json({ erro: 'Mesa não encontrada' });
        res.json(mesa);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

exports.atualizarMesa = async (req, res) => {
    try {
        const mesa = await Mesa.findByPk(req.params.id);
        if (!mesa) return res.status(404).json({ erro: 'Mesa não encontrada' });
        let { numero, capacidade, disponivel, descricao } = req.body;
        numero = Number(numero);
        capacidade = Number(capacidade);
        disponivel = disponivel === 'false' ? false : !!disponivel;

        // Novo: sobrescrever imagens com as recebidas (respeitando ordem e exclusão)
        let imagens = [];
        // Se vier imagens existentes (string JSON)
        if (req.body.imagens && typeof req.body.imagens === 'string') {
            try {
                const imgs = JSON.parse(req.body.imagens);
                if (Array.isArray(imgs)) imagens = imgs;
            } catch {}
        }
        // Adiciona novas imagens do upload ao final
        if (req.files && req.files.length > 0) {
            imagens = imagens.concat(req.files.map(file => `/uploads/${file.filename}`));
        }
        imagens = imagens.slice(0, 3);
        await mesa.update({ numero, capacidade, disponivel, descricao, imagens });
        res.json(mesa);
    } catch (err) {
        res.status(400).json({ erro: err.message });
    }
};

exports.excluirMesa = async (req, res) => {
    try {
        const mesa = await Mesa.findByPk(req.params.id);
        if (!mesa) return res.status(404).json({ erro: 'Mesa não encontrada' });

        await mesa.destroy();
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

exports.listarMesasDisponiveis = async (req, res) => {
    try {
        const restauranteId = req.query.restauranteId;

        if (!restauranteId) {
            return res.status(400).json({ erro: 'O parâmetro restauranteId é obrigatório.' });
        }

        console.log('Listando mesas disponíveis para restauranteId:', restauranteId);
        const mesasDisponiveis = await Mesa.findAll({ where: { restauranteId, disponivel: true } });
        res.json(mesasDisponiveis);
    } catch (error) {
        console.error('Erro ao listar mesas disponíveis:', error);
        res.status(500).json({ erro: 'Erro ao listar mesas disponíveis.' });
    }
};