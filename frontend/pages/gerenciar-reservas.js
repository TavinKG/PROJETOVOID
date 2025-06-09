// pages/gerenciar-reservas.js
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import LogoutButton from '../components/LogoutButton';
import Head from 'next/head';

export default function GerenciarReservas() {
    const router = useRouter();
    const userId = Cookies.get('userId'); 
    const tipoUsuario = Cookies.get('tipoUsuario'); 
    const [condominioID, setCondominioId] = useState(null);
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ESTADOS PARA FILTROS
    const [filterAreaId, setFilterAreaId] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [areasComunsCondominio, setAreasComunsCondominio] = useState([]); // NOVO: Para popular o filtro de áreas

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

    // NOVO: Função para buscar as áreas comuns para o filtro de área
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

        // Constrói a query string com os filtros
        const queryParams = new URLSearchParams();
        if (filterAreaId) queryParams.append('areaId', filterAreaId);
        if (filterStatus !== '') queryParams.append('status', filterStatus); // Status '0' é válido
        if (filterDate) queryParams.append('date', filterDate); // Formato YYYY-MM-DD

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
    }, [condominioID, filterAreaId, filterStatus, filterDate]); // Dependências dos filtros

    useEffect(() => {
        if (condominioID) {
            fetchReservas(); // Busca reservas quando o ID do condomínio ou filtros mudam
            fetchAreasComunsParaFiltro(); // Busca áreas comuns para popular o filtro
        }
    }, [condominioID, fetchReservas, fetchAreasComunsParaFiltro]); // Adicionadas dependências

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
                fetchReservas(); // Recarrega a lista para mostrar o status atualizado
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
                <title>Gerenciar Reservas - Condomínio</title>
            </Head>

            <div className="container mt-5">
                <h1 className="mb-4">Gerenciar Reservas {condominioID && `no Condomínio (${condominioID})`}</h1>

                <button
                    type="button"
                    className="btn btn-secondary mb-4 me-2"
                    onClick={() => router.push(`/condo?id=${condominioID}`)}
                >
                    Voltar para o Condomínio
                </button>

                <LogoutButton />

                {/* Seção de Filtros */}
                <div className="mb-4 p-3 border rounded bg-light">
                    <h4>Filtros</h4>
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label htmlFor="filterArea" className="form-label">Área</label>
                            <select id="filterArea" className="form-select" value={filterAreaId} onChange={(e) => setFilterAreaId(e.target.value)}>
                                <option value="">Todas as Áreas</option>
                                {/* Popula as opções de área comum */}
                                {areasComunsCondominio.map(area => (
                                    <option key={area.id} value={area.id}>{area.nome}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="filterStatus" className="form-label">Status</label>
                            <select id="filterStatus" className="form-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <option value="">Todos os Status</option>
                                <option value="0">Pendente</option>
                                <option value="1">Aprovada</option>
                                <option value="2">Recusada</option>
                                <option value="5">Cancelada</option>
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="filterDate" className="form-label">Data</label>
                            <input type="date" id="filterDate" className="form-control" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                        </div>
                    </div>
                    {/* O botão "Aplicar Filtros" é removido, pois a busca é automática ao mudar os filtros */}
                    {/* <button className="btn btn-primary mt-3">Aplicar Filtros</button> */}
                </div>

                {/* Mensagens de Carregamento/Erro/Vazio */}
                {loading && <p className="text-info mt-4">Carregando reservas...</p>}
                {error && <p className="text-danger mt-4">{error}</p>}

                {!loading && !error && reservas.length === 0 && (
                    <p className="text-info mt-4">Nenhuma reserva encontrada para este condomínio.</p>
                )}

                {/* Lista de Reservas para o Administrador */}
                {!loading && !error && reservas.length > 0 && (
                    <div className="row mt-4">
                        {reservas.map(reserva => (
                            <div key={reserva.id} className="col-12 col-md-6 col-lg-4 mb-4">
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body">
                                        <h5 className="card-title">Reserva: {reserva.titulo || 'Sem Título'}</h5>
                                        <p className="card-text">
                                            <strong>ID da Reserva:</strong> {reserva.id}
                                        </p>
                                        <p className="card-text">
                                            <strong>Área:</strong> {reserva.areas_comuns ? reserva.areas_comuns.nome : 'N/A'}
                                        </p>
                                        <p className="card-text">
                                            <strong>Usuário:</strong> {reserva.usuario ? reserva.usuario.nome : 'N/A'} (ID: {reserva.usuario_id})
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

                                        {/* Ações do Administrador */}
                                        <div className="mt-3 d-flex flex-wrap gap-2">
                                            {reserva.status === '0' && (
                                                <>
                                                    <button 
                                                        className="btn btn-success btn-sm"
                                                        onClick={() => alterarStatusReserva(reserva.id, '1')} // Aprovar
                                                    >
                                                        Aprovar
                                                    </button>
                                                    <button 
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => alterarStatusReserva(reserva.id, '2')} // Recusar
                                                    >
                                                        Recusar
                                                    </button>
                                                </>
                                            )}
                                            {reserva.status !== '5' && (
                                                <button 
                                                    className="btn btn-warning btn-sm text-dark"
                                                    onClick={() => alterarStatusReserva(reserva.id, '5')} // Cancelar
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