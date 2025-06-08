// controllers/ReservaController.js

const ReservaDAO = require('../dao/ReservaDAO');
const Reserva = require('../models/Reserva');
// Importar UsuarioCondominioDAO se precisar verificar permissões de usuário/condomínio
// const UsuarioCondominioDAO = require('../dao/UsuarioCondominioDAO'); 

class ReservaController {

    static async criarReserva(req, res) {
        const { areaId, usuarioId, dataInicio, dataFim, titulo, observacoes } = req.body;

        // Validações básicas (você pode adicionar mais, ex: se dataInicio < dataFim)
        if (!areaId || !usuarioId || !dataInicio || !dataFim) {
            return res.status(400).json({ message: 'Dados mínimos da reserva incompletos.' });
        }

        // Definir o status inicial como 'pendente' (0)
        const statusInicial = 0; 

        try {
            // --- Lógica de Validação de Conflito (IMPORTANTE - Próxima Etapa) ---
            // Antes de criar, você deve verificar se já existe uma reserva conflitante (aprovada ou pendente)
            // para a mesma areaId e intervalo de tempo.
            // Por enquanto, vamos apenas inserir. A lógica de verificação de conflito virá depois.

            const novaReserva = new Reserva(
                null, // ID será gerado pelo banco
                areaId,
                usuarioId,
                dataInicio,
                dataFim,
                statusInicial,
                titulo,
                observacoes
            );

            const reservaCriada = await ReservaDAO.criarReserva(novaReserva);

            res.status(201).json({
                message: 'Solicitação de reserva criada com sucesso!',
                data: reservaCriada,
            });

        } catch (error) {
            console.error('Erro ao criar solicitação de reserva:', error);
            res.status(500).json({ message: 'Erro ao criar solicitação de reserva.' });
        }
    }

    // --- Futuros Métodos Controller para Reserva ---
    // static async verificarDisponibilidade(req, res) { ... }
    // static async aprovarOuRecusarReserva(req, res) { ... }
    // static async cancelarReserva(req, res) { ... }
}

module.exports = ReservaController;