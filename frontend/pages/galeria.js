import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import LogoutButton from '../components/LogoutButton';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

export default function Galeria() {
    const router = useRouter();
    const userId = Cookies.get('userId');
    const tipoUsuario = Cookies.get('tipoUsuario');
    const [condominioID, setCondominioId] = useState(null);
    const [condominioNome, setCondominioNome] = useState('');
    const [galerias, setGalerias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showCriarGaleriaModal, setShowCriarGaleriaModal] = useState(false);
    const [novaGaleriaNome, setNovaGaleriaNome] = useState('');

    useEffect(() => {
        if (!userId) {
            router.push('/login');
        } else {
            const { id } = router.query;
            if (id) {
                setCondominioId(id);
            } else {
                console.error("ID do condomínio não encontrado na URL para galeria.");
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

    const fetchGalerias = useCallback(async () => {
        if (!condominioID) return;

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:5000/api/galerias/condominio/${condominioID}`);
            if (response.ok) {
                const data = await response.json();
                setGalerias(data.galerias || []);
            } else {
                const errorData = await response.json();
                console.error('Erro ao buscar galerias:', errorData.message || response.statusText);
                setError(`Erro ao carregar galerias: ${errorData.message || 'Erro desconhecido.'}`);
                setGalerias([]);
            }
        } catch (err) {
            console.error('Erro ao conectar com a API de galerias:', err);
            setError('Não foi possível conectar com o servidor para buscar as galerias.');
            setGalerias([]);
        } finally {
            setLoading(false);
        }
    }, [condominioID]);

    useEffect(() => {
        if (condominioID) {
            fetchGalerias();
            fetchCondominioNome();
        }
    }, [condominioID, fetchGalerias, fetchCondominioNome]);

    const handleCriarGaleria = async (e) => {
        e.preventDefault();
        if (!novaGaleriaNome || !condominioID || !userId) {
            alert('Preencha o nome da galeria.');
            return;
        }

        const galeriaData = {
            nome: novaGaleriaNome,
            condominio_id: condominioID,
            criador_id: userId,
        };

        try {
            const response = await fetch('http://localhost:5000/api/galerias/criar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(galeriaData),
            });

            if (response.ok) {
                alert('Galeria criada com sucesso!');
                setShowCriarGaleriaModal(false);
                setNovaGaleriaNome('');
                fetchGalerias();
            } else {
                const errorData = await response.json();
                console.error('Erro ao criar galeria:', errorData.message || response.statusText);
                alert(`Erro ao criar galeria: ${errorData.message || 'Erro desconhecido.'}`);
            }
        } catch (error) {
            console.error('Erro de rede ou ao criar galeria:', error);
            alert('Erro ao processar a criação da galeria.');
        }
    };

    return (
        <>
            <Head>
                <title>{condominioNome ? `${condominioNome} - Galeria de Fotos` : 'Galeria de Fotos - Condomínio'}</title>
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
                    Galeria de Fotos {condominioNome ? `do Condomínio ${condominioNome}` : 'no Condomínio'}
                </h1>

                {}
                <div className="d-flex flex-wrap align-items-center mb-4">
                    {tipoUsuario === 'Administrador' && (
                        <button
                            type="button"
                            className="btn btn-info me-2 rounded-pill"
                            onClick={() => setShowCriarGaleriaModal(true)}
                        >
                            Criar Nova Galeria
                        </button>
                    )}
                </div>

                {}
                {loading && <p className="text-info mt-4">Carregando galerias...</p>}
                {error && <p className="text-danger mt-4">{error}</p>}

                {!loading && !error && galerias.length === 0 && (
                    <p className="text-info mt-4">Nenhuma galeria encontrada para este condomínio.</p>
                )}

                {}
                {!loading && !error && galerias.length > 0 && (
                    <div className="row mt-4">
                        {galerias.map(galeria => (
                            <div key={galeria.id} className="col-12 col-md-6 col-lg-4 mb-4">
                                <Link href={`/galeria/${galeria.id}/fotos?condominioId=${condominioID}`} className="text-decoration-none text-dark">
                                    <div className="card h-100 shadow-sm rounded-4" >
                                        {galeria.foto_capa_url && (
                                            <img 
                                                src={galeria.foto_capa_url} 
                                                className="card-img-top rounded-4" 
                                                alt={`Capa da galeria ${galeria.nome}`} 
                                                style={{ height: '200px', objectFit: 'cover' }}
                                            />
                                        )}
                                        <div className="card-body">
                                            <h5 className="card-title">{galeria.nome}</h5>
                                            <p className="card-text">
                                                Criada por: {galeria.criador ? galeria.criador.nome : 'N/A'}
                                            </p>
                                            {}
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {}
            {showCriarGaleriaModal && tipoUsuario === 'Administrador' && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content" style={{ backgroundColor: '#fff', color: 'rgb(3 7 18)', fontWeight: 'bold' }}>
                            <div className="modal-header">
                                <h5 className="modal-title">Criar Nova Galeria de Fotos</h5>
                                <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowCriarGaleriaModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleCriarGaleria}>
                                    <div className="mb-3">
                                        <label htmlFor="novaGaleriaNome" className="form-label">Nome da Galeria</label>
                                        <input
                                            type="text"
                                            id="novaGaleriaNome"
                                            className="form-control"
                                            value={novaGaleriaNome}
                                            onChange={(e) => setNovaGaleriaNome(e.target.value)}
                                            required
                                            placeholder="Ex: Festa Junina 2024"
                                        />
                                    </div>
                                    <div className="d-flex justify-content-end mt-4">
                                        <button type="submit" className="btn btn-info rounded-pill">
                                            <strong>
                                                Criar Galeria
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