import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import LogoutButton from '../components/LogoutButton';
import Head from 'next/head';
import Image from 'next/image';

export default function Assembleias() {
    const router = useRouter();
    const userId = Cookies.get('userId');
    const tipoUsuario = Cookies.get('tipoUsuario');
    const [condominioID, setCondominioId] = useState(null);
    const [condominioNome, setCondominioNome] = useState('');
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


    const fetchAssembleias = useCallback(async () => {
        if (!condominioID) return;

        setLoading(true);
        setError(null);
        try {
            const url = `http://localhost:5000/api/assembleias/condominio/${condominioID}?userId=${userId}`;

            const response = await fetch(url);

            if (response.ok) {
                const data = await response.json();
                const now = new Date(); 
                
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
            fetchCondominioNome();
        }
    }, [condominioID, fetchAssembleias, fetchCondominioNome]);

    const handleAgendarAssembleia = async (e) => {
        e.preventDefault();
        if (!assembleiaTitle || !assembleiaDate || !assembleiaTime || !condominioID || !userId) {
            alert('Preencha todos os campos obrigatórios para agendar a assembleia.');
            return;
        }

        const dataHora = new Date(`${assembleiaDate}T${assembleiaTime}:00.000Z`); 
        const now = new Date();
        now.setSeconds(0, 0); 
        const agendamentoUTC = new Date(assembleiaDate + 'T' + assembleiaTime + ':00.000Z');

        if (isNaN(dataHora.getTime()) || agendamentoUTC < now) {
            alert('Data e hora da assembleia inválidas ou no passado. Agende para um horário futuro.');
            return;
        }

        const assembleiaData = {
            titulo: assembleiaTitle,
            data_hora: dataHora.toISOString(),
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
                fetchAssembleias();
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
                fetchAssembleias();
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

    const formatDateTime = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC'
        }) + ' às ' + date.toLocaleTimeString('pt-BR', {
            hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC'
        });
    };

    return (
        <>
            <Head>
                {}
                <title>{condominioNome ? `${condominioNome} - Assembleias` : 'Assembleias - Condomínio'}</title>
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
                    Assembleias {condominioNome ? `do Condomínio ${condominioNome}` : 'do Condomínio'}
                    {}
                </h1>

                {}
                <div className="d-flex flex-wrap align-items-center mb-4">
                    {tipoUsuario === 'Administrador' && (
                        <button
                            type="button"
                            className="btn btn-info me-2 rounded-pill"
                            onClick={() => setShowAgendarModal(true)}
                        >
                            Agendar Nova Assembleia
                        </button>
                    )}
                </div>

                {}
                {loading && <p className="text-info mt-4">Carregando assembleias...</p>}
                {error && <p className="text-danger mt-4">{error}</p>}

                {!loading && !error && assembleias.length === 0 && (
                    <p className="text-info mt-4">Nenhuma assembleia agendada para este condomínio.</p>
                )}

                {}
                {!loading && !error && assembleias.length > 0 && (
                    <div className="row mt-4">
                        {assembleias.map(assembleia => (
                            <div key={assembleia.id} className="col-12 col-md-6 col-lg-4 mb-4">
                                <div className="card h-100 shadow-sm rounded-4" style={{backgroundColor: 'rgb(3 7 18)', color: '#fff', border: '2px solid #4fc1e9'}}>
                                    <div className="card-body">
                                        <h5 className="card-title mb-4">{assembleia.titulo}</h5>
                                        <p className="card-text">
                                            <strong>Data e Hora:</strong> {formatDateTime(assembleia.data_hora)}
                                        </p>
                                        <p className="card-text">
                                            <strong>Descrição:</strong> {assembleia.descricao || 'N/A'}
                                        </p>
                                        <p className="card-text">
                                            <strong>Agendada por:</strong> {assembleia.criador ? assembleia.criador.nome : 'N/A'}
                                        </p>

                                        {}
                                        {tipoUsuario === 'Morador' && (
                                            <div className="mt-3">
                                                {assembleia.presencaConfirmada ? (
                                                    <span className="badge bg-success">Presença Confirmada!</span>
                                                ) : (
                                                    <button
                                                        className="btn btn-success btn-sm rounded-pill"
                                                        onClick={() => handleConfirmarPresenca(assembleia.id)}
                                                    >
                                                        Confirmar Presença
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {}
                                        {tipoUsuario === 'Administrador' && (
                                            <div className="mt-3">
                                                <button 
                                                    className="btn btn-info btn-sm me-2 rounded-pill"
                                                    onClick={() => handleVerParticipantesClick(assembleia.id)}
                                                    style={{fontWeight:'bold'}}
                                                >
                                                    Ver Participantes
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {}
            {showAgendarModal && tipoUsuario === 'Administrador' && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content" style={{color:'rgb(3 7 18)'}}>
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
                                            min={new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                    </div>
                                    <style jsx global>{`
                                        input[type="date"]::-webkit-calendar-picker-indicator {
                                            filter: invert(1); /* deixa o ícone branco */
                                        }
                                    `}</style>
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
                                    <style jsx global>{`
                                        input[type="time"]::-webkit-calendar-picker-indicator {
                                            filter: invert(1); /* deixa o ícone branco */
                                        }
                                    `}</style>
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
                                        <button type="submit" className="btn btn-info rounded-pill" style={{fontWeight:'bold'}}>
                                            Agendar Assembleia
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {}
            {showParticipantesModal && tipoUsuario === 'Administrador' && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content" style={{color:'rgb(3 7 18)'}}>
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
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}