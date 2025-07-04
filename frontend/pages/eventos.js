import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import LogoutButton from '../components/LogoutButton';
import Head from 'next/head';
import Image from 'next/image';

export default function Eventos() {
    const router = useRouter();
    const userId = Cookies.get('userId');
    const tipoUsuario = Cookies.get('tipoUsuario');
    const [condominioID, setCondominioId] = useState(null);
    const [condominioNome, setCondominioNome] = useState('');
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showAgendarModal, setShowAgendarModal] = useState(false);
    const [eventoNome, setEventoNome] = useState('');
    const [eventoData, setEventoData] = useState('');
    const [eventoHora, setEventoHora] = useState('');
    const [eventoLocal, setEventoLocal] = useState('');
    const [eventoDescricao, setEventoDescricao] = useState('');

    useEffect(() => {
        if (!userId) {
            router.push('/login');
        } else {
            const { id } = router.query;
            if (id) {
                setCondominioId(id);
            } else {
                console.error("ID do condomínio não encontrado na URL para eventos.");
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

    const fetchEventos = useCallback(async () => {
        if (!condominioID) return;

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:5000/api/eventos/condominio/${condominioID}`);
            if (response.ok) {
                const data = await response.json();
                const now = new Date();
                
                const futurosEventos = data.eventos ? 
                    data.eventos.filter(e => new Date(e.data_hora).getTime() >= now.getTime()) : [];
                
                setEventos(futurosEventos.sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime()));
            } else {
                const errorData = await response.json();
                console.error('Erro ao buscar eventos:', errorData.message || response.statusText);
                setError(`Erro ao carregar eventos: ${errorData.message || 'Erro desconhecido.'}`);
                setEventos([]);
            }
        } catch (err) {
            console.error('Erro ao conectar com a API de eventos:', err);
            setError('Não foi possível conectar com o servidor para buscar os eventos.');
            setEventos([]);
        } finally {
            setLoading(false);
        }
    }, [condominioID]);

    useEffect(() => {
        if (condominioID) {
            fetchEventos();
            fetchCondominioNome();
        }
    }, [condominioID, fetchEventos, fetchCondominioNome]);

    const handleAgendarEvento = async (e) => {
        e.preventDefault();
        if (!eventoNome || !eventoData || !eventoHora || !eventoLocal || !condominioID || !userId) {
            alert('Preencha todos os campos obrigatórios para agendar o evento (Nome, Data, Hora, Local).');
            return;
        }

        const dataHora = new Date(`${eventoData}T${eventoHora}:00.000Z`); 
        
        const now = new Date();
        now.setSeconds(0, 0); 
        const agendamentoUTC = new Date(eventoData + 'T' + eventoHora + ':00.000Z');

        if (isNaN(dataHora.getTime()) || agendamentoUTC.getTime() < now.getTime()) {
            alert('Data e hora do evento inválidas ou no passado. Agende para um horário futuro.');
            return;
        }

        const eventoDataObj = {
            nome: eventoNome,
            data_hora: dataHora.toISOString(),
            local: eventoLocal,
            descricao: eventoDescricao,
            condominio_id: condominioID,
            criador_id: userId,
        };

        try {
            const response = await fetch('http://localhost:5000/api/eventos/agendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventoDataObj),
            });

            if (response.ok) {
                alert('Evento agendado com sucesso!');
                setShowAgendarModal(false);
                setEventoNome('');
                setEventoData('');
                setEventoHora('');
                setEventoLocal('');
                setEventoDescricao('');
                fetchEventos();
            } else {
                const errorData = await response.json();
                console.error('Erro ao agendar evento:', errorData.message || response.statusText);
                alert(`Erro ao agendar evento: ${errorData.message || 'Erro desconhecido.'}`);
            }
        } catch (error) {
            console.error('Erro de rede ou ao agendar evento:', error);
            alert('Erro ao processar o agendamento do evento.');
        }
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
                <title>{condominioNome ? `${condominioNome} - Eventos` : 'Eventos - Condomínio'}</title>
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
                <h1 className="mb-4">
                    Eventos {condominioNome ? `do Condomínio ${condominioNome}` : 'no Condomínio'}
                </h1>

                {}
                <div className="d-flex flex-wrap align-items-center mb-4">
                    {tipoUsuario === 'Administrador' && (
                        <button
                            type="button"
                            className="btn btn-info me-2 rounded-pill"
                            onClick={() => setShowAgendarModal(true)}
                        >
                            Agendar Novo Evento
                        </button>
                    )}
                </div>

                {}
                {loading && <p className="text-info mt-4">Carregando eventos...</p>}
                {error && <p className="text-danger mt-4">{error}</p>}

                {!loading && !error && eventos.length === 0 && (
                    <p className="text-info mt-4">Nenhum evento agendado para este condomínio.</p>
                )}

                {}
                {!loading && !error && eventos.length > 0 && (
                    <div className="row mt-4">
                        {eventos.map(evento => (
                            <div key={evento.id} className="col-12 col-md-6 col-lg-4 mb-4">
                                <div className="card h-100 shadow-sm rounded-4" style={{backgroundColor: 'rgb(3 7 18)', color: '#fff', border: '2px solid #4fc1e9'}}>
                                    <div className="card-body">
                                        <h5 className="card-title mb-4">{evento.nome}</h5>
                                        <p className="card-text">
                                            <strong>Data e Hora:</strong> {formatDateTime(evento.data_hora)}
                                        </p>
                                        <p className="card-text">
                                            <strong>Local:</strong> {evento.local || 'N/A'}
                                        </p>
                                        <p className="card-text">
                                            <strong>Descrição:</strong> {evento.descricao || 'N/A'}
                                        </p>
                                        <p className="card-text">
                                            <strong>Criado por:</strong> {evento.criador ? evento.criador.nome : 'N/A'}
                                        </p>
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
                        <div className="modal-content" style={{ backgroundColor: '#fff', color: 'rgb(3 7 18)'}}>
                            <div className="modal-header">
                                <h5 className="modal-title">Agendar Novo Evento</h5>
                                <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowAgendarModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleAgendarEvento}>
                                    <div className="mb-3">
                                        <label htmlFor="eventoNome" className="form-label">Nome do Evento</label>
                                        <input
                                            type="text"
                                            id="eventoNome"
                                            className="form-control"
                                            value={eventoNome}
                                            onChange={(e) => setEventoNome(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="eventoLocal" className="form-label">Local</label>
                                        <input
                                            type="text"
                                            id="eventoLocal"
                                            className="form-control"
                                            value={eventoLocal}
                                            onChange={(e) => setEventoLocal(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="eventoDate" className="form-label">Data</label>
                                        <input
                                            type="date"
                                            id="eventoDate"
                                            className="form-control"
                                            value={eventoData}
                                            onChange={(e) => setEventoData(e.target.value)}
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
                                        <label htmlFor="eventoHora" className="form-label">Hora</label>
                                        <input
                                            type="time"
                                            id="eventoHora"
                                            className="form-control"
                                            value={eventoHora}
                                            onChange={(e) => setEventoHora(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <style jsx global>{`
                                        input[type="time"]::-webkit-calendar-picker-indicator {
                                            filter: invert(1); /* deixa o ícone branco */
                                        }
                                    `}</style>
                                    <div className="mb-3">
                                        <label htmlFor="eventoDescricao" className="form-label">Descrição (opcional)</label>
                                        <textarea
                                            id="eventoDescricao"
                                            className="form-control"
                                            rows="3"
                                            value={eventoDescricao}
                                            onChange={(e) => setEventoDescricao(e.target.value)}
                                        ></textarea>
                                    </div>
                                    <div className="d-flex justify-content-end mt-4">
                                        <button type="submit" className="btn btn-info rounded-pill" style={{color:'rgb(3 7 18)'}}>
                                            <strong>
                                                Agendar Evento
                                            </strong>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}