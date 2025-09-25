const Reserva = require('../models/Reserva');
const Mesa = require('../models/Mesa');
const Restaurante = require('../models/Restaurante');

exports.criarReserva = async (req, res) => {
    try {
        console.log('Dados recebidos para criar reserva:', req.body);

        const { dataHora, mesaId, numeroPessoas, observacao } = req.body;

        // Verificar se a mesa está disponível
        const mesa = await Mesa.findByPk(mesaId);
        if (!mesa || !mesa.disponivel) {
            console.error('Erro: Mesa não está disponível ou não encontrada.');
            return res.status(400).json({ erro: 'Mesa não está disponível' });
        }

        // Validar horário da reserva com base no horário de funcionamento do restaurante
        const restaurante = await Restaurante.findOne({
            where: { id: mesa.restauranteId },
        });
        if (!restaurante) {
            return res.status(404).json({ erro: 'Restaurante não encontrado' });
        }

        const reservationTime = new Date(dataHora).toTimeString().slice(0, 5);
        if (
            reservationTime < restaurante.horarioInicio ||
            reservationTime > restaurante.horarioFim
        ) {
            return res.status(400).json({
                erro: `Horário de reserva inválido. Por favor, selecione um horário entre ${restaurante.horarioInicio} e ${restaurante.horarioFim}.`,
            });
        }

        // Criar a reserva
        const reserva = await Reserva.create({
            dataHora,
            mesaId,
            usuarioId: req.usuario.id, // ID do usuário autenticado
            numeroPessoas,
            observacao,
        });

        // Atualizar a disponibilidade da mesa
        await mesa.update({ disponivel: false });

        // Buscar a reserva criada com os detalhes da mesa e restaurante (usando alias)
        const reservaDetalhada = await Reserva.findByPk(reserva.id, {
            include: [
                {
                    model: Mesa,
                    as: 'Mesa',
                    attributes: ['numero', 'descricao'],
                    include: [
                        {
                            model: Restaurante,
                            as: 'Restaurante',
                            attributes: ['nome'],
                        },
                    ],
                },
            ],
        });

        res.status(201).json(reservaDetalhada);
    } catch (err) {
        console.error('Erro ao criar reserva:', err);
        res.status(500).json({ erro: err.message });
    }
};

exports.obterReservas = async (req, res) => {
    try {
        const reservas = await Reserva.findAll({
            where: { usuarioId: req.usuario.id },
            include: [
                {
                    model: Mesa,
                    as: 'Mesa', // Usa o alias correto
                    attributes: ['numero', 'descricao'],
                    include: [
                        {
                            model: Restaurante,
                            as: 'Restaurante', // Usa o alias correto
                            attributes: ['nome'],
                        },
                    ],
                },
            ],
            attributes: ['id', 'dataHora', 'status', 'numeroPessoas', 'observacao'],
        });
        res.json(reservas);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

exports.cancelarReserva = async (req, res) => {
    try {
        const reserva = await Reserva.findByPk(req.params.id);
        if (!reserva) {
            return res.status(404).json({ erro: 'Reserva não encontrada' });
        }

        // Atualizar a disponibilidade da mesa
        const mesa = await Mesa.findByPk(reserva.mesaId);
        if (mesa) {
            await mesa.update({ disponivel: true });
        }

        // Cancelar a reserva
        await reserva.update({ status: 'Cancelada' });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

exports.obterReservaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const reserva = await Reserva.findByPk(id, {
            include: [
                {
                    model: Mesa,
                    as: 'Mesa',
                    attributes: ['id', 'numero', 'descricao', 'restauranteId'],
                    include: [
                        {
                            model: Restaurante,
                            as: 'Restaurante',
                            attributes: ['id', 'nome'],
                        },
                    ],
                },
            ],
        });
        if (!reserva) {
            return res.status(404).json({ erro: 'Reserva não encontrada' });
        }
        res.json(reserva);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};