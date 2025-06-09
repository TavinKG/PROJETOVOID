// pages/assembleias.js
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import LogoutButton from '../components/LogoutButton';
import Head from 'next/head';

export default function Assembleias() {
    const router = useRouter();
    const userId = Cookies.get('userId'); // O userId do usuário logado
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
            // NOVO: Adiciona userId como query param (ou header)
            const url = `http://localhost:5000/api/assembleias/condominio/${condominioID}?userId=${userId}`; // Passando userId como query param para teste
            // OU, melhor prática (se backend configurar): const response = await fetch(url, { headers: { 'x-user-id': userId } });

            const response = await fetch(url);

            if (response.ok) {
                const data = await response.json();
                const now = new Date(); 
                
                const futurasAssembleias = data.assembleias ? 
                    data.assembleias.filter(a => new Date(a.data_hora) >= now) : [];
                
                setAssembleias(futurasAssembleias.sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora)));
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
    }, [condominioID, userId]); // Adicionado userId como dependência

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

    // Função para formatar data e hora para exibição
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
                                                {assembleia.presencaConfirmada ? ( // NOVO: Renderiza condicionalmente
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

                                        {/* Ações de Administrador (Gerenciar) - Futuramente */}
                                        {tipoUsuario === 'Administrador' && (
                                            <div className="mt-3">
                                                {/* Botões para editar/cancelar assembleia, ou ver participantes */}
                                                <button className="btn btn-sm btn-outline-secondary me-2" disabled>Ver Participantes</button>
                                                <button className="btn btn-sm btn-outline-info me-2" disabled>Editar</button>
                                                <button className="btn btn-sm btn-outline-danger" disabled>Excluir</button>
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
        </>
    );
}