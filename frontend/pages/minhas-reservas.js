// pages/minhas-reservas.js
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import LogoutButton from '../components/LogoutButton';
import Head from 'next/head';

export default function MinhasReservas() {
    const router = useRouter();
    const userId = Cookies.get('userId'); 
    const [condominioID, setCondominioId] = useState(null);
    const [minhasReservas, setMinhasReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) { // Redireciona se não houver usuário logado
            router.push('/login');
        } else {
            // Pega o ID do condomínio da URL
            const { condominioId } = router.query;
            if (condominioId) {
                setCondominioId(condominioId);
            } else {
                console.error("ID do condomínio não encontrado na URL para listar reservas.");
                setError("ID do condomínio não encontrado para listar reservas.");
                setLoading(false);
            }
        }
    }, [userId, router]);

    const fetchMinhasReservas = useCallback(async () => {
        if (!userId || !condominioID) return; // Só busca se tiver ambos os IDs

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:5000/api/reservas/usuario/${userId}/condominio/${condominioID}`);
            
            if (response.ok) {
                const data = await response.json();
                setMinhasReservas(data.reservas || []);
            } else {
                const errorData = await response.json();
                console.error('Erro ao buscar minhas reservas:', errorData.message || response.statusText);
                setError(`Erro ao carregar suas reservas: ${errorData.message || 'Erro desconhecido.'}`);
                setMinhasReservas([]);
            }
        } catch (err) {
            console.error('Erro ao conectar com a API de reservas:', err);
            setError('Não foi possível conectar com o servidor para buscar suas reservas.');
            setMinhasReservas([]);
        } finally {
            setLoading(false);
        }
    }, [userId, condominioID]);

    useEffect(() => {
        if (userId && condominioID) {
            fetchMinhasReservas();
        }
    }, [userId, condominioID, fetchMinhasReservas]);

    // Função para formatar o status da reserva
    const formatStatus = (status) => {
        switch (status) {
            case '0': return <span className="badge bg-warning text-dark">Aguardando Aprovação</span>;
            case '1': return <span className="badge bg-success">Aprovada</span>;
            case '2': return <span className="badge bg-danger">Recusada</span>;
            case '5': return <span className="badge bg-secondary">Cancelada</span>;
            default: return <span className="badge bg-info">Desconhecido</span>;
        }
    };

    return (
        <>
            <Head>
                <title>Minhas Reservas - Condomínio</title>
            </Head>

            <div className="container mt-5">
                <h1 className="mb-4">Minhas Reservas {condominioID && `no Condomínio (${condominioID})`}</h1>

                {/* Botão de Voltar para o Condomínio */}
                <button
                    type="button"
                    className="btn btn-secondary mb-4 me-2"
                    onClick={() => router.push(`/condo?id=${condominioID}`)}
                >
                    Voltar para o Condomínio
                </button>

                <LogoutButton />

                {loading && <p className="text-info mt-4">Carregando suas reservas...</p>}
                {error && <p className="text-danger mt-4">{error}</p>}

                {!loading && !error && minhasReservas.length === 0 && (
                    <p className="text-info mt-4">Você não possui reservas para este condomínio.</p>
                )}

                {!loading && !error && minhasReservas.length > 0 && (
                    <div className="row mt-4">
                        {minhasReservas.map(reserva => {
                            const dataInicioUTC = new Date(reserva.data_inicio);
                            const dataFimUTC = new Date(reserva.data_fim);

                            // Formatar a data para DD/MM/YYYY
                            const dataFormatada = dataInicioUTC.toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            });

                            // Formatar o horário para HH:MM em UTC (para evitar deslocamento de fuso horário local)
                            const horarioInicioFormatado = dataInicioUTC.getUTCHours().toString().padStart(2, '0') + ':' + dataInicioUTC.getUTCMinutes().toString().padStart(2, '0');
                            const horarioFimFormatado = dataFimUTC.getUTCHours().toString().padStart(2, '0') + ':' + dataFimUTC.getUTCMinutes().toString().padStart(2, '0');

                            return (
                                <div key={reserva.id} className="col-12 col-md-6 col-lg-4 mb-4">
                                    <div className="card h-100 shadow-sm">
                                        <div className="card-body">
                                            <h5 className="card-title">Reserva: {reserva.titulo || 'Sem Título'}</h5>
                                            <p className="card-text">
                                                <strong>Área:</strong> {reserva.areas_comuns ? reserva.areas_comuns.nome : 'N/A'}
                                            </p>
                                            <p className="card-text">
                                                <strong>Início:</strong> {dataFormatada} às {horarioInicioFormatado}
                                            </p>
                                            <p className="card-text">
                                                <strong>Fim:</strong> {dataFormatada} às {horarioFimFormatado}
                                            </p>
                                            <p className="card-text">
                                                <strong>Status:</strong> {formatStatus(reserva.status)}
                                            </p>
                                            <p className="card-text">
                                                <strong>Observações:</strong> {reserva.observacoes || 'N/A'}
                                            </p>
                                            {/* Você pode adicionar um botão de cancelar aqui futuramente */}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}