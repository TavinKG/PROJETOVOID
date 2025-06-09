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
                console.error("ID do condomínio não encontrado na URL.");
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
            // Este é o endpoint que o backend precisará implementar!
            // Ele deve retornar as reservas do userId para o condominioID
            const response = await fetch(`http://localhost:5000/api/reservas/usuario/${userId}/condominio/${condominioID}`);
            
            if (response.ok) {
                const data = await response.json();
                setMinhasReservas(data.reservas || []); // Assumindo que o backend retorna um objeto com 'reservas'
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
            case '0': return <span className="badge bg-warning text-dark">Pendente</span>; // CORREÇÃO AQUI: '0' como string
            case '1': return <span className="badge bg-info">Aprovada</span>;   // CORREÇÃO AQUI: '1' como string
            case '2': return <span className="badge bg-danger">Recusada</span>;
            case '5': return <span className="badge bg-secondary">Cancelada</span>;    // CORREÇÃO AQUI: '2' como string
            default: return <span className="badge bg-secondary">Desconhecido</span>;
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
                        {minhasReservas.map(reserva => (
                            <div key={reserva.id} className="col-12 col-md-6 col-lg-4 mb-4">
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body">
                                        <h5 className="card-title">Reserva: {reserva.titulo || 'Sem Título'}</h5>
                                        <p className="card-text">
                                            <strong>Área:</strong> {reserva.area ? reserva.area.nome : 'Carregando...'}
                                        </p>
                                        <p className="card-text">
                                            <strong>Início:</strong> {new Date(reserva.data_inicio).toLocaleString('pt-BR')}
                                        </p>
                                        <p className="card-text">
                                            <strong>Fim:</strong> {new Date(reserva.data_fim).toLocaleString('pt-BR')}
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
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}