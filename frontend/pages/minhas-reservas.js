import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import LogoutButton from '../components/LogoutButton';
import Head from 'next/head';
import Image from 'next/image';

export default function MinhasReservas() {
    const router = useRouter();
    const userId = Cookies.get('userId'); 
    const [condominioID, setCondominioId] = useState(null);
    const [condominioNome, setCondominioNome] = useState('');
    const [minhasReservas, setMinhasReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) {
            router.push('/login');
        } else {
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

    const fetchCondominioNome = useCallback(async () => {
        if (!condominioID) return;
        try {
            const response = await fetch(`http://localhost:5000/api/condominios/${condominioID}`);
            if (response.ok) {
                const data = await response.json();
                setCondominioNome(data.nome);
            } else {
                console.error('Erro ao buscar nome do condomínio:', response.statusText);
                setCondominioNome('Condomínio Desconhecido');
            }
        } catch (error) {
            console.error('Erro de rede ao buscar nome do condomínio:', error);
            setCondominioNome('Erro ao Carregar Nome');
        }
    }, [condominioID]);


    const fetchMinhasReservas = useCallback(async () => {
        if (!userId || !condominioID) return;

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
            fetchCondominioNome();
        }
    }, [userId, condominioID, fetchMinhasReservas, fetchCondominioNome]);

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
                {}
                <title>{condominioNome ? `${condominioNome} - Minhas Reservas` : 'Minhas Reservas - Condomínio'}</title>
            </Head>

            <nav className="navbar navbar-expand-lg shadow-sm" style={{height:'10vh'}}> {}
                <div className="container-fluid">
                    {}
                    <a className="navbar-brand d-flex align-items-center" href="/home">
                        <Image 
                            src="/logos/horizontal-escuro-cheio.png"
                            alt="VOID Logo" 
                            width={170} 
                            height={170} 
                            priority={true} 
                            style={{marginLeft:'125px', objectFit: 'contain'}}
                        />
                    </a>
    
                    {}
                    <div className="d-flex align-items-center" style={{marginRight:'125px'}}>
                        {}
                        <button
                            type="button"
                            className="btn btn-secondary me-2 rounded-pill"
                            onClick={() => router.push(`/condo?id=${condominioID}`)}
                        >
                            Voltar
                        </button>

                        <LogoutButton />
                    </div>
                </div>
            </nav>

            <div className="container mt-5">
                {}
                <h1 className="mb-4">
                    Minhas Reservas {condominioNome ? `no Condomínio ${condominioNome}` : 'no Condomínio'}
                    {}
                </h1>

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

                            const dataFormatada = dataInicioUTC.toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            });

                            const horarioInicioFormatado = dataInicioUTC.toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                                timeZone: 'UTC'
                            });
                            const horarioFimFormatado = dataFimUTC.toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                                timeZone: 'UTC'
                            });

                            return (
                                <div key={reserva.id} className="col-12 col-md-6 col-lg-4 mb-4">
                                    <div className="card h-100 shadow-sm rounded-4" style={{backgroundColor: 'rgb(3 7 18)', color: '#fff', border: '2px solid #4fc1e9'}}>
                                        <div className="card-body">
                                            <h5 className="card-title mb-4">Reserva: {reserva.titulo || 'Sem Título'}</h5>
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