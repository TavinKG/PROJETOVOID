// pages/assembleias.js
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import LogoutButton from '../components/LogoutButton';
import Head from 'next/head';

// Removido import de Calendar e seu CSS, pois não são usados diretamente nesta página
// import Calendar from 'react-calendar';
// import 'react-calendar/dist/Calendar.css';


export default function Assembleias() {
    const router = useRouter();
    const userId = Cookies.get('userId');
    const tipoUsuario = Cookies.get('tipoUsuario');
    const [condominioID, setCondominioId] = useState(null);
    const [assembleias, setAssembleias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showAgendarModal, setShowAgendarModal] = useState(false);
    const [assembleiaTitle, setAssembleiaTitle] = useState('');
    const [assembleiaDate, setAssembleiaDate] = useState('');
    const [assembleiaTime, setAssembleiaTime] = useState('');
    const [assembleiaDescription, setAssembleiaDescription] = useState('');

    const [showParticipantesModal, setShowParticipantesModal] = useState(false);
    const [participantes, setParticipantes] = useState([]);
    const [currentAssembleiaId, setCurrentAssembleiaId] = useState(null);
    const [loadingParticipantes, setLoadingParticipantes] = useState(false);
    const [errorParticipantes, setErrorParticipantes] = useState(null);


    useEffect(() => {
        if (!userId) {
            router.push('/login');
        } else {
            const { id } = router.query;
            if (id) {
                setCondominioId(id);
            } else {
                console.error("ID do condomínio não encontrado na URL para assembleias.");
                setError("ID do condomínio não encontrado.");
                setLoading(false);
            }
        }
    }, [userId, router]);

    const fetchAssembleias = useCallback(async () => {
        if (!condominioID) return;

        setLoading(true);
        setError(null);
        try {
            const url = `http://localhost:5000/api/assembleias/condominio/${condominioID}?userId=${userId}`;

            const response = await fetch(url);

            if (response.ok) {
                const data = await response.json();
                
                // NOVO: Filtrar assembleias futuras APÓS a hidratação, ou com fuso horário consistente
                // Para evitar hydration errors, fazemos a data de comparação uma vez ao carregar.
                // OU, uma abordagem mais simples para hydration: não filtrar por `now` aqui no cliente.
                // Deixe o backend mandar tudo e filtre no backend se precisar.
                // Por enquanto, vamos manter a lógica de filtro de "futuras" aqui, mas simplificar a comparação.
                const now = new Date(); // Criada uma única vez para este render/ciclo de vida do useEffect
                
                const futurasAssembleias = data.assembleias ? 
                    data.assembleias.filter(a => new Date(a.data_hora).getTime() >= now.getTime()) : [];
                
                setAssembleias(futurasAssembleias.sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime()));
            } else {
                const errorData = await response.json();
                console.error('Erro ao buscar assembleias:', errorData.message || response.statusText);
                setError(`Erro ao carregar assembleias: ${errorData.message || 'Erro desconhecido.'}`);
                setAssembleias([]);
            }
        } catch (err) {
            console.error('Erro ao conectar com a API de assembleias:', err);
            setError('Não foi possível conectar com o servidor para buscar as assembleias.');
            setAssembleias([]);
        } finally {
            setLoading(false);
        }
    }, [condominioID, userId]);

    const fetchParticipantes = useCallback(async (assembleiaId) => {
        if (!assembleiaId) return;

        setLoadingParticipantes(true);
        setErrorParticipantes(null);
        try {
            const response = await fetch(`http://localhost:5000/api/assembleias/${assembleiaId}/participantes`);
            if (response.ok) {
                const data = await response.json();
                setParticipantes(data.participantes || []);
            } else {
                const errorData = await response.json();
                console.error('Erro ao buscar participantes:', errorData.message || response.statusText);
                setErrorParticipantes(`Erro ao carregar participantes: ${errorData.message || 'Erro desconhecido.'}`);
                setParticipantes([]);
            }
        } catch (err) {
            console.error('Erro de rede ao buscar participantes:', err);
            setErrorParticipantes('Não foi possível conectar com o servidor para buscar os participantes.');
            setParticipantes([]);
        } finally {
            setLoadingParticipantes(false);
        }
    }, []);

    useEffect(() => {
        if (condominioID) {
            fetchAssembleias();
        }
    }, [condominioID, fetchAssembleias]);

    const handleAgendarAssembleia = async (e) => {
        e.preventDefault();
        if (!assembleiaTitle || !assembleiaDate || !assembleiaTime || !condominioID || !userId) {
            alert('Preencha todos os campos obrigatórios para agendar a assembleia.');
            return;
        }

        // Criar data/hora para envio SEMPRE EM UTC
        const dataHora = new Date(`${assembleiaDate}T${assembleiaTime}:00.000Z`); 
        
        // Validação de data no passado - compare com UTC now
        const nowUTC = new Date(); // Objeto Date atual no fuso horário local
        const agendamentoUTC = new Date(assembleiaDate + 'T' + assembleiaTime + ':00.000Z'); // Data agendada em UTC

        if (isNaN(dataHora.getTime()) || agendamentoUTC.getTime() < nowUTC.getTime()) { // Compara os timestamps em UTC
            alert('Data e hora da assembleia inválidas ou no passado. Agende para um horário futuro.');
            return;
        }

        const assembleiaData = {
            titulo: assembleiaTitle,
            data_hora: dataHora.toISOString(), // Envia em formato ISO (UTC)
            descricao: assembleiaDescription,
            condominio_id: condominioID,
            criador_id: userId,
        };

        try {
            const response = await fetch('http://localhost:5000/api/assembleias/agendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(assembleiaData),
            });

            if (response.ok) {
                alert('Assembleia agendada com sucesso!');
                setShowAgendarModal(false);
                setAssembleiaTitle('');
                setAssembleiaDate('');
                setAssembleiaTime('');
                setAssembleiaDescription('');
                fetchAssembleias(); // Recarrega a lista
            } else {
                const errorData = await response.json();
                console.error('Erro ao agendar assembleia:', errorData.message || response.statusText);
                alert(`Erro ao agendar assembleia: ${errorData.message || 'Erro desconhecido.'}`);
            }
        } catch (error) {
            console.error('Erro de rede ou ao agendar assembleia:', error);
            alert('Erro ao processar o agendamento da assembleia.');
        }
    };

    const handleConfirmarPresenca = async (assembleiaId) => {
        if (!confirm('Tem certeza que deseja confirmar sua presença nesta assembleia?')) {
            return;
        }
        try {
            const response = await fetch(`http://localhost:5000/api/assembleias/${assembleiaId}/confirmar-presenca`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuarioId: userId }),
            });

            if (response.ok) {
                alert('Presença confirmada com sucesso!');
                fetchAssembleias(); // Recarrega a lista para atualizar a visualização (incluindo o status da presença)
            } else {
                const errorData = await response.json();
                console.error('Erro ao confirmar presença:', errorData.message || response.statusText);
                alert(`Erro ao confirmar presença: ${errorData.message || 'Erro desconhecido.'}`);
            }
        } catch (error) {
            console.error('Erro de rede ou ao confirmar presença:', error);
            alert('Erro ao processar a confirmação de presença.');
        }
    };

    const handleVerParticipantesClick = async (assembleiaId) => {
        setCurrentAssembleiaId(assembleiaId);
        await fetchParticipantes(assembleiaId);
        setShowParticipantesModal(true);
    };

    const closeParticipantesModal = () => {
        setShowParticipantesModal(false);
        setParticipantes([]);
        setCurrentAssembleiaId(null);
        setErrorParticipantes(null);
    };

    // Função para formatar data e hora para exibição (em UTC)
    // Usada por ambas as renderizações (SSR e Cliente) e garante consistência
    const formatDateTime = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        // Garante que a formatação seja sempre em UTC, independentemente do fuso horário do servidor/cliente
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC'
        }) + ' às ' + date.toLocaleTimeString('pt-BR', {
            hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC'
        });
    };

    return (
        <>
            <Head>
                <title>Assembleias - Condomínio</title>
            </Head>

            <div className="container mt-5">
                <h1 className="mb-4">Assembleias {condominioID && `no Condomínio (${condominioID})`}</h1>

                {/* Botões de Ação */}
                <div className="d-flex flex-wrap align-items-center mb-4">
                    <button
                        type="button"
                        className="btn btn-secondary me-2 mb-2"
                        onClick={() => router.push(`/condo?id=${condominioID}`)}
                    >
                        Voltar para o Condomínio
                    </button>

                    {tipoUsuario === 'Administrador' && (
                        <button
                            type="button"
                            className="btn btn-primary me-2 mb-2"
                            onClick={() => setShowAgendarModal(true)}
                        >
                            Agendar Nova Assembleia
                        </button>
                    )}
                    <LogoutButton />
                </div>

                {/* Mensagens de Carregamento/Erro/Vazio */}
                {loading && <p className="text-info mt-4">Carregando assembleias...</p>}
                {error && <p className="text-danger mt-4">{error}</p>}

                {!loading && !error && assembleias.length === 0 && (
                    <p className="text-info mt-4">Nenhuma assembleia agendada para este condomínio.</p>
                )}

                {/* Lista de Assembleias */}
                {!loading && !error && assembleias.length > 0 && (
                    <div className="row mt-4">
                        {assembleias.map(assembleia => (
                            <div key={assembleia.id} className="col-12 col-md-6 col-lg-4 mb-4">
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body">
                                        <h5 className="card-title">{assembleia.titulo}</h5>
                                        <p className="card-text">
                                            <strong>Data e Hora:</strong> {formatDateTime(assembleia.data_hora)}
                                        </p>
                                        <p className="card-text">
                                            <strong>Descrição:</strong> {assembleia.descricao || 'N/A'}
                                        </p>
                                        <p className="card-text">
                                            <strong>Agendada por:</strong> {assembleia.criador ? assembleia.criador.nome : 'N/A'}
                                        </p>

                                        {/* Ações de Morador (Confirmar Presença) */}
                                        {tipoUsuario === 'Morador' && (
                                            <div className="mt-3">
                                                {assembleia.presencaConfirmada ? (
                                                    <span className="badge bg-success">Presença Confirmada!</span>
                                                ) : (
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        onClick={() => handleConfirmarPresenca(assembleia.id)}
                                                    >
                                                        Confirmar Presença
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* Ações de Administrador (Gerenciar) */}
                                        {tipoUsuario === 'Administrador' && (
                                            <div className="mt-3">
                                                <button 
                                                    className="btn btn-info btn-sm me-2"
                                                    onClick={() => handleVerParticipantesClick(assembleia.id)}
                                                >
                                                    Ver Participantes
                                                </button>
                                                {/* Botões de Editar e Excluir foram removidos */}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL PARA AGENDAR ASSEMBLEIA (APENAS ADMIN) */}
            {showAgendarModal && tipoUsuario === 'Administrador' && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Agendar Nova Assembleia</h5>
                                <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowAgendarModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleAgendarAssembleia}>
                                    <div className="mb-3">
                                        <label htmlFor="assembleiaTitle" className="form-label">Título da Assembleia</label>
                                        <input
                                            type="text"
                                            id="assembleiaTitle"
                                            className="form-control"
                                            value={assembleiaTitle}
                                            onChange={(e) => setAssembleiaTitle(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="assembleiaDate" className="form-label">Data</label>
                                        <input
                                            type="date"
                                            id="assembleiaDate"
                                            className="form-control"
                                            value={assembleiaDate}
                                            onChange={(e) => setAssembleiaDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]} // Data mínima é hoje
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="assembleiaTime" className="form-label">Hora</label>
                                        <input
                                            type="time"
                                            id="assembleiaTime"
                                            className="form-control"
                                            value={assembleiaTime}
                                            onChange={(e) => setAssembleiaTime(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="assembleiaDescription" className="form-label">Descrição (opcional)</label>
                                        <textarea
                                            id="assembleiaDescription"
                                            className="form-control"
                                            rows="3"
                                            value={assembleiaDescription}
                                            onChange={(e) => setAssembleiaDescription(e.target.value)}
                                        ></textarea>
                                    </div>
                                    <div className="d-flex justify-content-end mt-4">
                                        <button type="button" className="btn btn-secondary me-2" onClick={() => setShowAgendarModal(false)}>
                                            Cancelar
                                        </button>
                                        <button type="submit" className="btn btn-primary">
                                            Agendar Assembleia
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL PARA LISTAR PARTICIPANTES (APENAS ADMIN) */}
            {showParticipantesModal && tipoUsuario === 'Administrador' && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Participantes da Assembleia</h5>
                                <button type="button" className="btn-close" aria-label="Close" onClick={closeParticipantesModal}></button>
                            </div>
                            <div className="modal-body">
                                {loadingParticipantes && <p className="text-info">Carregando participantes...</p>}
                                {errorParticipantes && <p className="text-danger">{errorParticipantes}</p>}
                                {!loadingParticipantes && !errorParticipantes && participantes.length === 0 && (
                                    <p className="text-muted">Nenhum participante confirmou presença ainda.</p>
                                )}
                                {!loadingParticipantes && !errorParticipantes && participantes.length > 0 && (
                                    <ul className="list-group">
                                        {participantes.map(participante => (
                                            <li key={participante.id} className="list-group-item d-flex justify-content-between align-items-center">
                                                {participante.nome} ({participante.email})
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeParticipantesModal}>
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}