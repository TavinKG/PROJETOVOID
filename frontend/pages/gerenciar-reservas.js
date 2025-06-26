import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import LogoutButton from '../components/LogoutButton';
import Head from 'next/head';
import Image from 'next/image';

export default function GerenciarReservas() {
    const router = useRouter();
    const userId = Cookies.get('userId'); 
    const tipoUsuario = Cookies.get('tipoUsuario'); 
    const [condominioID, setCondominioId] = useState(null);
    const [condominioNome, setCondominioNome] = useState('');
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filterAreaId, setFilterAreaId] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [areasComunsCondominio, setAreasComunsCondominio] = useState([]);

    useEffect(() => {
        if (!userId || tipoUsuario !== 'Administrador') {
            router.push('/login'); 
        } else {
            const { id } = router.query;
            if (id) {
                setCondominioId(id);
            } else {
                console.error("ID do condomínio não encontrado na URL para gerenciar reservas.");
                setError("ID do condomínio não encontrado.");
                setLoading(false);
            }
        }
    }, [userId, tipoUsuario, router]);

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


    const fetchAreasComunsParaFiltro = useCallback(async () => {
        if (!condominioID) return;
        try {
            const response = await fetch(`http://localhost:5000/api/condominios/${condominioID}/areas-comuns`);
            if (response.ok) {
                const data = await response.json();
                setAreasComunsCondominio(data.areas || []);
            } else {
                console.error('Erro ao buscar áreas comuns para filtro:', response.statusText);
            }
        } catch (err) {
            console.error('Erro ao conectar com a API de áreas comuns para filtro:', err);
        }
    }, [condominioID]);

    const fetchReservas = useCallback(async () => {
        if (!condominioID) return;

        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();
        if (filterAreaId) queryParams.append('areaId', filterAreaId);
        if (filterStatus !== '') queryParams.append('status', filterStatus);
        if (filterDate) queryParams.append('date', filterDate);

        const queryString = queryParams.toString();
        const url = `http://localhost:5000/api/reservas/condominio/${condominioID}${queryString ? `?${queryString}` : ''}`; 

        try {
            const response = await fetch(url);
            
            if (response.ok) {
                const data = await response.json();
                setReservas(data.reservas || []);
            } else {
                const errorData = await response.json();
                console.error('Erro ao buscar reservas para gerenciamento:', errorData.message || response.statusText);
                setError(`Erro ao carregar reservas: ${errorData.message || 'Erro desconhecido.'}`);
                setReservas([]);
            }
        } catch (err) {
            console.error('Erro ao conectar com a API de gerenciamento de reservas:', err);
            setError('Não foi possível conectar com o servidor para buscar as reservas.');
            setReservas([]);
        } finally {
            setLoading(false);
        }
    }, [condominioID, filterAreaId, filterStatus, filterDate]);

    useEffect(() => {
        if (condominioID) {
            fetchReservas();
            fetchAreasComunsParaFiltro();
            fetchCondominioNome();
        }
    }, [condominioID, fetchReservas, fetchAreasComunsParaFiltro, fetchCondominioNome]);

    const alterarStatusReserva = async (reservaId, novoStatus) => {
        if (!confirm(`Tem certeza que deseja alterar o status da reserva ${reservaId} para ${novoStatus}?`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/reservas/${reservaId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: novoStatus }),
            });

            if (response.ok) {
                alert('Status da reserva atualizado com sucesso!');
                fetchReservas();
            } else {
                const errorData = await response.json();
                console.error('Erro ao alterar status da reserva:', errorData.message || response.statusText);
                alert(`Erro ao alterar status: ${errorData.message || 'Erro desconhecido.'}`);
            }
        } catch (error) {
            console.error('Erro de rede ou ao alterar status da reserva:', error);
            alert('Erro ao processar a alteração do status.');
        }
    };

    const formatStatus = (status) => {
        switch (status) {
            case '0': return <span className="badge bg-warning text-dark">Pendente</span>;
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
                <title>{condominioNome ? `${condominioNome} - Gerenciar Reservas` : 'Gerenciar Reservas - Condomínio'}</title>
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
                        <button
                            type="button"
                            className="btn btn-secondary me-3 rounded-pill"
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
                    {condominioNome ? `Gerenciar Reservas do Condomínio ${condominioNome}` : 'Gerenciar Reservas do Condomínio'}
                    {}
                </h1>

                {}
                <div className="mt-4 mb-4 p-3 rounded-4" style={{border: '2px solid #4fc1e9'}}>
                    <h4>Filtros</h4>
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label htmlFor="filterArea" className="form-label">Área</label>
                            <select id="filterArea" className="form-select rounded-pill" value={filterAreaId} onChange={(e) => setFilterAreaId(e.target.value)} style={{backgroundColor: '#4fc1e9', border: 'none', fontWeight: 'bold'}}>
                                <option value="" style={{fontWeight:'bold'}}>Todas as Áreas</option>
                                {areasComunsCondominio.map(area => (
                                    <option key={area.id} value={area.id} style={{fontWeight:'bold'}}>{area.nome}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="filterStatus" className="form-label">Status</label>
                            <select id="filterStatus" className="form-select rounded-pill" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{backgroundColor: '#4fc1e9', border: 'none', fontWeight:'bold'}}>
                                <option value="" style={{fontWeight:'bold'}}>Todos os Status</option>
                                <option value="0" style={{fontWeight:'bold'}}>Pendente</option>
                                <option value="1" style={{fontWeight:'bold'}}>Aprovada</option>
                                <option value="2" style={{fontWeight:'bold'}}>Recusada</option>
                                <option value="5" style={{fontWeight:'bold'}}>Cancelada</option>
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="filterDate" className="form-label">Data</label>
                            <input type="date" id="filterDate" className="form-control rounded-pill" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={{backgroundColor: '#4fc1e9', border: 'none', fontWeight:'bold'}}/>
                        </div>
                    </div>
                </div>

                {}
                {loading && <p className="text-info mt-4">Carregando reservas...</p>}
                {error && <p className="text-danger mt-4">{error}</p>}

                {!loading && !error && reservas.length === 0 && (
                    <p className="text-info mt-4">Nenhuma reserva encontrada para este condomínio.</p>
                )}

                {}
                {!loading && !error && reservas.length > 0 && (
                    <div className="row mt-4">
                        {reservas.map(reserva => (
                            <div key={reserva.id} className="col-12 col-md-6 col-lg-4 mb-4">
                                <div className="card h-100 shadow-sm rounded-4" style={{backgroundColor: 'rgb(3 7 18)', border:'2px solid #4fc1e9', color:'#fff'}}>
                                    <div className="card-body">
                                        <h5 className="card-title">Reserva: {reserva.titulo || 'Sem Título'}</h5>
                                        <p className="card-text">
                                            <strong>ID da Reserva:</strong> {reserva.id}
                                        </p>
                                        <p className="card-text">
                                            <strong>Área:</strong> {reserva.areas_comuns ? reserva.areas_comuns.nome : 'N/A'}
                                        </p>
                                        <p className="card-text">
                                            <strong>Usuário:</strong> {reserva.usuario ? reserva.usuario.nome : 'N/A'}
                                        </p>
                                        <p className="card-text">
                                            <strong>Início:</strong> {new Date(reserva.data_inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })} às {new Date(reserva.data_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' })}
                                        </p>
                                        <p className="card-text">
                                            <strong>Fim:</strong> {new Date(reserva.data_fim).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })} às {new Date(reserva.data_fim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' })}
                                        </p>
                                        <p className="card-text">
                                            <strong>Status:</strong> {formatStatus(reserva.status)}
                                        </p>
                                        <p className="card-text">
                                            <strong>Observações:</strong> {reserva.observacoes || 'N/A'}
                                        </p>

                                        <div className="mt-3 d-flex flex-wrap gap-2">
                                            {reserva.status === '0' && (
                                                <>
                                                    <button 
                                                        className="btn btn-success btn-sm rounded-pill"
                                                        onClick={() => alterarStatusReserva(reserva.id, '1')}
                                                    >
                                                        Aprovar
                                                    </button>
                                                    <button 
                                                        className="btn btn-danger btn-sm rounded-pill"
                                                        onClick={() => alterarStatusReserva(reserva.id, '2')}
                                                    >
                                                        Recusar
                                                    </button>
                                                </>
                                            )}
                                            {reserva.status !== '5' && (
                                                <button 
                                                    className="btn btn-warning btn-sm text-dark rounded-pill"
                                                    onClick={() => alterarStatusReserva(reserva.id, '5')}
                                                >
                                                    Cancelar
                                                </button>
                                            )}
                                        </div>
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