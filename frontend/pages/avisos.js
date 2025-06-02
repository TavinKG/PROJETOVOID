import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState, useCallback } from 'react'; // Adicionado useCallback
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import LogoutButton from '../components/LogoutButton';
import Head from 'next/head'; // Importar Head para o título da página

export default function Avisos() {
    const router = useRouter();
    const userId = Cookies.get('userId');
    const [condominioID, setCondominioId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [titulo, setTitulo] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [listaAvisos, setListaAvisos] = useState([]);
    const [tipoUsuario, setTipoUsuario] = useState(null);

    useEffect(() => {
        if (!userId) {
            router.push('/login');
        } else {
            setCondominioId(router.query.id);
            setTipoUsuario(Cookies.get('tipoUsuario'));
        }
    }, [tipoUsuario, userId, router]);

    const fetchListaAvisos = useCallback(async () => {
        if (!condominioID) return; // Garante que condominioID existe

        try {
            const response = await fetch(`http://localhost:5000/api/avisos/${condominioID}/list`);
            if (response.ok) {
                const data = await response.json();
                setListaAvisos(data.avisoData || []);
            } else {
                console.error('Erro ao listar avisos:', response.statusText);
                setListaAvisos([]);
            }
        } catch (error) {
            console.error('Erro ao listar avisos:', error);
            setListaAvisos([]);
        }
    }, [condominioID]); // Depende do condominioID

    useEffect(() => {
        if (condominioID) {
            fetchListaAvisos();
        }
    }, [condominioID, fetchListaAvisos]); // Adicionado fetchListaAvisos como dependência

    const criarAviso = async () => {
        // Enviar a data no formato ISO para o backend
        const avisoData = {
            id: null, // O ID deve ser gerado pelo backend/banco de dados
            titulo,
            mensagem,
            autor: userId,
            date: new Date().toISOString(), // CORREÇÃO AQUI: Apenas toISOString()
            condominioId: condominioID,
        };

        try {
            const response = await fetch('http://localhost:5000/api/avisos/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(avisoData),
            });

            if (response.ok) {
                alert('Aviso criado com sucesso!');
                setTitulo('');
                setMensagem('');
                setModalOpen(false);
                fetchListaAvisos(); // Recarrega a lista para mostrar o novo aviso
            } else {
                const error = await response.json();
                console.error('Erro ao criar aviso:', error.message);
                alert(`Erro: ${error.message || 'Erro desconhecido ao criar aviso.'}`);
            }
        } catch (error) {
            console.error('Erro ao criar aviso:', error);
            alert('Erro ao processar a solicitação.');
        }
    };

    return (
        <>
            <Head>
                <title>Avisos - Condomínio</title> {/* Título da página */}
            </Head>

            <div className="container mt-5"> {/* Container para melhor organização */}
                <h1 className="mb-4">Avisos do Condomínio</h1> {/* Título da página */}

                {tipoUsuario === 'Administrador' && (
                    <button
                        type="button"
                        className="btn btn-success mb-4" // Adicionado margem inferior
                        onClick={() => setModalOpen(true)}
                    >
                        Criar Aviso
                    </button>
                )}

                {/* Modal de criação de aviso */}
                {modalOpen && (
                    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}> {/* Adicionado background */}
                        <div className="modal-dialog modal-dialog-centered"> {/* Centralizado o modal */}
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Criar Novo Aviso</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setModalOpen(false)}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label htmlFor="titulo" className="form-label">
                                            Título
                                        </label>
                                        <input
                                            type="text"
                                            id="titulo"
                                            className="form-control"
                                            value={titulo}
                                            onChange={(e) => setTitulo(e.target.value)}
                                            required // Campo obrigatório
                                            placeholder="Ex: Manutenção da Piscina"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="mensagem" className="form-label">
                                            Mensagem
                                        </label>
                                        <textarea
                                            id="mensagem"
                                            className="form-control"
                                            rows="4"
                                            value={mensagem}
                                            onChange={(e) => setMensagem(e.target.value)}
                                            required // Campo obrigatório
                                            placeholder="Descreva o aviso aqui..."
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setModalOpen(false)}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={criarAviso}
                                    >
                                        Salvar Aviso
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {listaAvisos.length > 0 ? (
                    <div className="mt-4">
                        {listaAvisos.map((aviso) => {
                            // CORREÇÃO AQUI: Usar toLocaleDateString para formatação robusta e localizada
                            const date = new Date(aviso.data);
                            const dataFormatada = date.toLocaleDateString('pt-BR', { // Formato DD/MM/YYYY
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            });

                            return (
                                <div key={aviso.id} className="card mb-3 shadow-sm"> {/* Adicionado sombra */}
                                    <div className="card-body">
                                        <h5 className="card-title">{aviso.titulo}</h5>
                                        <p className="card-text mb-1">
                                            <strong>Autor:</strong> {aviso.usuario ? aviso.usuario.nome : 'Desconhecido'} {/* Verifica se usuario existe */}
                                        </p>
                                        <p className="card-text mb-1">
                                            <strong>Mensagem:</strong> {aviso.mensagem}
                                        </p>
                                        <p className="card-text mb-0"> {/* Removido margem inferior se for o último item */}
                                            <strong>Data:</strong> {dataFormatada}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-info">Não foram encontrados avisos para este condomínio.</p>
                )}

                {/* Botão de Logout */}
                <div className="mt-4">
                    <LogoutButton />
                </div>
            </div>
        </>
    );
}