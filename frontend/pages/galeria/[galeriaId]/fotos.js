// pages/galeria/[galeriaId]/fotos.js
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import LogoutButton from '../../../components/LogoutButton'; // Ajuste o caminho conforme a profundidade
import Head from 'next/head';

export default function FotosGaleria() {
    const router = useRouter();
    const { galeriaId, condominioId } = router.query;
    const userId = Cookies.get('userId');
    const tipoUsuario = Cookies.get('tipoUsuario');

    const [galeriaNome, setGaleriaNome] = useState('');
    const [condominioNome, setCondominioNome] = useState('');
    const [fotos, setFotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ESTADOS PARA O MODAL DE UPLOAD DE FOTO
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileDescription, setFileDescription] = useState('');
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    // NOVOS ESTADOS PARA O MODAL DE VISUALIZAÇÃO DE IMAGEM COMPLETA
    const [showImageViewer, setShowImageViewer] = useState(false);
    const [currentImageUrl, setCurrentImageUrl] = useState('');
    const [currentImageDescription, setCurrentImageDescription] = useState('');


    useEffect(() => {
        if (!userId) {
            router.push('/login');
        } else if (!galeriaId || !condominioId) {
            console.error("IDs de galeria ou condomínio não encontrados na URL.");
            setError("IDs de galeria ou condomínio não encontrados. Por favor, volte para a galeria principal.");
            setLoading(false);
        }
    }, [userId, galeriaId, condominioId, router]);

    const fetchCondominioNome = useCallback(async () => {
        if (!condominioId) return;
        try {
            const response = await fetch(`http://localhost:5000/api/condominios/${condominioId}`);
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
    }, [condominioId]);

    const fetchGaleriaNome = useCallback(async () => {
        if (!galeriaId) return;
        try {
            const response = await fetch(`http://localhost:5000/api/galerias/condominio/${condominioId}`);
            if (response.ok) {
                const data = await response.json();
                const foundGaleria = data.galerias.find(g => String(g.id) === String(galeriaId));
                if (foundGaleria) {
                    setGaleriaNome(foundGaleria.nome);
                } else {
                    setGaleriaNome('Galeria Desconhecida');
                }
            } else {
                console.error('Erro ao buscar nome da galeria:', response.statusText);
                setGaleriaNome('Galeria Desconhecida');
            }
        } catch (error) {
            console.error('Erro de rede ao buscar nome da galeria:', error);
            setGaleriaNome('Erro ao Carregar Nome');
        }
    }, [galeriaId, condominioId]);


    const fetchFotos = useCallback(async () => {
        if (!galeriaId || !tipoUsuario) return; 

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:5000/api/fotos/galeria/${galeriaId}`, {
                headers: { 'x-user-type': tipoUsuario },
            });
            if (response.ok) {
                const data = await response.json();
                setFotos(data.fotos || []);
            } else {
                const errorData = await response.json();
                console.error('Erro ao buscar fotos:', errorData.message || response.statusText);
                setError(`Erro ao carregar fotos: ${errorData.message || 'Erro desconhecido.'}`);
                setFotos([]);
            }
        } catch (err) {
            console.error('Erro ao conectar com a API de fotos:', err);
            setError('Não foi possível conectar com o servidor para buscar as fotos.');
            setFotos([]);
        } finally {
            setLoading(false);
        }
    }, [galeriaId, tipoUsuario]);

    useEffect(() => {
        if (galeriaId && condominioId) {
            fetchGaleriaNome();
            fetchCondominioNome();
            fetchFotos();
        }
    }, [galeriaId, condominioId, fetchGaleriaNome, fetchCondominioNome, fetchFotos]);


    // Lógica para upload de foto
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        } else {
            setSelectedFile(null);
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile || !galeriaId || !userId) {
            alert('Por favor, selecione um arquivo de imagem e preencha as informações necessárias.');
            return;
        }

        setUploadLoading(true);
        setUploadError(null);

        const photoStatus = tipoUsuario === 'Administrador' ? 'aprovada' : 'pendente';

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('descricao', fileDescription);
        formData.append('galeria_id', galeriaId);
        formData.append('usuario_id', userId);
        formData.append('status', photoStatus);

        try {
            const response = await fetch('http://localhost:5000/api/fotos/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                alert(`Foto enviada com sucesso! ${photoStatus === 'pendente' ? 'Aguardando aprovação do administrador.' : ''}`);
                setShowUploadModal(false);
                setSelectedFile(null);
                setFileDescription('');
                fetchFotos(); // Recarrega a lista de fotos
            } else {
                const errorData = await response.json();
                console.error('Erro ao enviar foto:', errorData.message || response.statusText);
                setUploadError(`Erro ao enviar foto: ${errorData.message || 'Erro desconhecido.'}`);
            }
        } catch (error) {
            console.error('Erro de rede ou ao enviar foto:', error);
            setUploadError('Erro de rede ao enviar foto. Tente novamente.');
        } finally {
            setUploadLoading(false);
        }
    };

    const alterarStatusFoto = async (fotoId, novoStatus) => {
        if (!confirm(`Tem certeza que deseja ${novoStatus === 'aprovada' ? 'aprovar' : 'rejeitar'} esta foto?`)) {
            return;
        }
        if (tipoUsuario !== 'Administrador') {
            alert('Apenas administradores podem moderar fotos.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/fotos/${fotoId}/status`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-user-type': tipoUsuario,
                },
                body: JSON.stringify({ status: novoStatus }),
            });

            if (response.ok) {
                alert(`Foto ${novoStatus === 'aprovada' ? 'aprovada' : 'rejeitada'} com sucesso!`);
                fetchFotos(); // Recarrega a lista de fotos
            } else {
                const errorData = await response.json();
                console.error('Erro ao alterar status da foto:', errorData.message || response.statusText);
                alert(`Erro ao alterar status: ${errorData.message || 'Erro desconhecido.'}`);
            }
        } catch (error) {
            console.error('Erro de rede ou ao alterar status da foto:', error);
            alert('Erro ao processar a alteração do status.');
        }
    };

    // NOVO: Função para abrir o visualizador de imagem
    const openImageViewer = (imageUrl, imageDescription) => {
        setCurrentImageUrl(imageUrl);
        setCurrentImageDescription(imageDescription || 'Visualização da Imagem');
        setShowImageViewer(true);
    };

    // NOVO: Função para fechar o visualizador de imagem
    const closeImageViewer = () => {
        setShowImageViewer(false);
        setCurrentImageUrl('');
        setCurrentImageDescription('');
    };

    return (
        <>
            <Head>
                <title>{galeriaNome ? `${galeriaNome} - Fotos` : 'Fotos da Galeria'}</title>
            </Head>

            <div className="container mt-5">
                <h1 className="mb-4">
                    Fotos da Galeria: {galeriaNome} {condominioNome && `(${condominioNome})`}
                </h1>

                <div className="d-flex flex-wrap align-items-center mb-4">
                    <button
                        type="button"
                        className="btn btn-secondary me-2 mb-2"
                        onClick={() => router.push(`/galeria?id=${condominioId}`)} 
                    >
                        Voltar para Galerias
                    </button>

                    {(tipoUsuario === 'Administrador' || tipoUsuario === 'Morador') && ( 
                        <button
                            type="button"
                            className="btn btn-primary me-2 mb-2"
                            onClick={() => setShowUploadModal(true)}
                        >
                            Adicionar Foto
                        </button>
                    )}
                    <LogoutButton />
                </div>

                {loading && <p className="text-info mt-4">Carregando fotos...</p>}
                {error && <p className="text-danger mt-4">{error}</p>}

                {!loading && !error && fotos.length === 0 && (
                    <p className="text-info mt-4">Nenhuma foto encontrada nesta galeria.</p>
                )}

                {/* Lista de Fotos */}
                {!loading && !error && fotos.length > 0 && (
                    <div className="row mt-4">
                        {fotos.map(foto => (
                            <div key={foto.id} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
                                <div className="card h-100 shadow-sm">
                                    {foto.url && (
                                        <img 
                                            src={foto.url} 
                                            className="card-img-top" 
                                            alt={foto.descricao || `Foto da galeria ${galeriaNome}`} 
                                            style={{ height: '200px', objectFit: 'cover', cursor: 'pointer' }} // Adicionado cursor: pointer
                                            onClick={() => openImageViewer(foto.url, foto.descricao)} // NOVO: Abre o visualizador ao clicar
                                        />
                                    )}
                                    <div className="card-body">
                                        <h5 className="card-title">{foto.descricao || 'Sem Descrição'}</h5>
                                        <p className="card-text text-muted" style={{ fontSize: '0.8rem' }}>
                                            Por: {foto.usuario ? foto.usuario.nome : 'N/A'} em {new Date(foto.criado_em).toLocaleDateString('pt-BR')}
                                        </p>
                                        {foto.status !== 'aprovada' && (tipoUsuario === 'Administrador' || (tipoUsuario === 'Morador' && String(foto.usuario_id) === String(userId))) && (
                                            <span className={`badge ${foto.status === 'pendente' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                                                {foto.status === 'pendente' ? 'Pendente' : 'Rejeitada'}
                                            </span>
                                        )}
                                        {tipoUsuario === 'Administrador' && foto.status !== 'aprovada' && (
                                            <div className="mt-3">
                                                <button 
                                                    className="btn btn-success btn-sm me-2"
                                                    onClick={() => alterarStatusFoto(foto.id, 'aprovada')}
                                                >
                                                    Aprovar
                                                </button>
                                                <button 
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => alterarStatusFoto(foto.id, 'rejeitada')}
                                                >
                                                    Rejeitar
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

            {/* MODAL PARA UPLOAD DE FOTO */}
            {showUploadModal && (tipoUsuario === 'Administrador' || tipoUsuario === 'Morador') && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Adicionar Foto à Galeria "{galeriaNome}"</h5>
                                <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowUploadModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleUploadSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="fileInput" className="form-label">Selecione a Imagem</label>
                                        <input
                                            type="file"
                                            id="fileInput"
                                            className="form-control"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="fileDescription" className="form-label">Descrição da Foto (opcional)</label>
                                        <textarea
                                            id="fileDescription"
                                            className="form-control"
                                            rows="2"
                                            value={fileDescription}
                                            onChange={(e) => setFileDescription(e.target.value)}
                                            placeholder="Ex: Festa Junina, Vista da piscina"
                                        ></textarea>
                                    </div>
                                    {uploadError && <p className="text-danger mt-2">{uploadError}</p>}
                                    <div className="d-flex justify-content-end mt-4">
                                        <button type="button" className="btn btn-secondary me-2" onClick={() => setShowUploadModal(false)}>
                                            Cancelar
                                        </button>
                                        <button type="submit" className="btn btn-primary" disabled={uploadLoading || !selectedFile}>
                                            {uploadLoading ? 'Enviando...' : 'Fazer Upload'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* NOVO MODAL: VISUALIZADOR DE IMAGEM COMPLETA */}
            {showImageViewer && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-xl" role="document"> {/* modal-xl para imagem grande */}
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{currentImageDescription}</h5>
                                <button type="button" className="btn-close" aria-label="Close" onClick={closeImageViewer}></button>
                            </div>
                            <div className="modal-body text-center">
                                <img 
                                    src={currentImageUrl} 
                                    alt={currentImageDescription} 
                                    className="img-fluid" 
                                    style={{ maxHeight: '80vh', maxWidth: '100%', objectFit: 'contain' }} // Ajusta imagem ao modal
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeImageViewer}>
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