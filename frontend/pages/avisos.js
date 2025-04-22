import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import LogoutButton from '../components/LogoutButton';

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

    useEffect(() => {
        if (condominioID) {
            fetchListaAvisos();
        }
    }, [condominioID]);

    const fetchListaAvisos = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/avisos/${condominioID}/list`);
            if (response.ok) {
                const data = await response.json();
                setListaAvisos(data.avisoData || []);
            } else {
                console.error('Erro ao listar avisos');
                setListaAvisos([]);
            }
        } catch (error) {
            console.error('Erro ao listar avisos:', error);
            setListaAvisos([]);
        }
    };

    const criarAviso = async () => {
        const avisoData = {
            id: null,
            titulo,
            mensagem,
            autor: userId,
            date: new Date().toISOString().toLocaleString('pt-BR'),
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
                fetchListaAvisos();
            } else {
                const error = await response.json();
                console.error('Erro ao criar aviso:', error.message);
                alert(`Erro: ${error.message}`);
            }
        } catch (error) {
            console.error('Erro ao criar aviso:', error);
            alert('Erro ao processar a solicitação.');
        }
    };

    return (
        <>
            {tipoUsuario === 'Administrador' && (
                <>
                    <button
                        type="button"
                        className="btn btn-success mt-3 me-2"
                        onClick={() => setModalOpen(true)}
                    >
                        Criar Aviso
                    </button>
                </>
            )}

            {/* Modal de criação de aviso */}
            {modalOpen && (
                <div className="modal d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Criar Aviso</h5>
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
                        <h2>Avisos</h2>
                        {listaAvisos.map((aviso) => {
                            const date = new Date(aviso.data);
                            console.log(date);
                            const dataFormatada = (date.getDate() < 10? '0' + date.getDate() : date.getDate()) + "/" + (date.getMonth() + 1 < 10? '0' + date.getMonth() + 1: date.getMonth() + 1) + '/' + date.getFullYear();

                            return(
                            <div key={aviso.id} className="card mb-3">
                                <div className="card-body">
                                    <h5 className="card-title">{aviso.titulo}</h5>
                                    <p className="card-text">
                                        <strong>Autor:</strong> {aviso.usuario.nome}
                                    </p>
                                    <p className="card-text">
                                        <strong>Mensagem:</strong> {aviso.mensagem}
                                    </p>
                                    <p className="card-text">
                                        <strong>Data:</strong> {dataFormatada}
                                    </p>
                                </div>
                            </div>
                        )})}
                    </div>
                ) : (
                    <p>Não foram encontrados avisos.</p>
                )
            }

            {/* Botão de Logout */}
            <div className="mt-4">
                <LogoutButton />
            </div>
        </>
    );
}