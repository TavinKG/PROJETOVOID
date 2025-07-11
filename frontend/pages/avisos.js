import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import LogoutButton from '../components/LogoutButton';
import Head from 'next/head';
import Image from 'next/image';

export default function Avisos() {
    const router = useRouter();
    const userId = Cookies.get('userId');
    const [condominioID, setCondominioId] = useState(null);
    const [condominioNome, setCondominioNome] = useState('');
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


    const fetchListaAvisos = useCallback(async () => {
        if (!condominioID) return;

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
    }, [condominioID]);

    useEffect(() => {
        if (condominioID) {
            fetchListaAvisos();
            fetchCondominioNome();
        }
    }, [condominioID, fetchListaAvisos, fetchCondominioNome]);

    const criarAviso = async () => {
        const avisoData = {
            id: null,
            titulo,
            mensagem,
            autor: userId,
            date: new Date().toISOString(),
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
                {}
                <title>{condominioNome ? `${condominioNome} - Avisos` : 'Avisos - Condomínio'}</title>
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
                            className="btn btn-secondary me-3 rounded-pill"
                            onClick={() => router.back()}
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
                    Avisos do Condomínio {condominioNome ? `${condominioNome}` : ''}
                    {}
                </h1>

                {tipoUsuario === 'Administrador' && (
                    <button
                        type="button"
                        className="btn btn-info mb-3 rounded-pill"
                        onClick={() => setModalOpen(true)}
                    >
                        Criar Aviso
                    </button>
                )}

                {}
                {modalOpen && (
                    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content" style={{ backgroundColor: '#fff', color: 'rgb(3 7 18)'}}>
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
                                            required
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
                                            required
                                            placeholder="Descreva o aviso aqui..."
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-info rounded-pill"
                                        onClick={criarAviso}
                                    ><strong>
                                        Salvar Aviso
                                    </strong></button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {listaAvisos.length > 0 ? (
                    <div className="mt-4">
                        {listaAvisos.map((aviso) => {
                            const date = new Date(aviso.data);
                            const dataFormatada = date.toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            });

                            return (
                                <div key={aviso.id} className="card mb-3 shadow-sm rounded-4" style={{backgroundColor: 'rgb(3 7 18)', color: '#fff', border: '2px solid #4fc1e9'}}>
                                    <div className="card-body">
                                        <h5 className="card-title mb-4">{aviso.titulo}</h5>
                                        <p className="card-text mb-1">
                                            <strong>Autor:</strong> {aviso.usuario ? aviso.usuario.nome : 'Desconhecido'}
                                        </p>
                                        <p className="card-text mb-1">
                                            <strong>Mensagem:</strong> {aviso.mensagem}
                                        </p>
                                        <p className="card-text mb-0">
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
            </div>
        </>
    );
}