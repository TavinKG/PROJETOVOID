// frontend/pages/galeria/[galeriaId]/fotos.js
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router'; // Para acessar router.query
import LogoutButton from '../../../components/LogoutButton'; // Ajuste o caminho se seu componente LogoutButton estiver em outro local
import Head from 'next/head';

export default function FotosGaleria() {
    const router = useRouter();
    // ESSENCIAL: Acessa os parâmetros dinâmicos da URL via router.query
    const { galeriaId, condominioId } = router.query; 
    
    // Outros estados do componente
    const userId = Cookies.get('userId'); // Pega o ID do usuário logado
    const tipoUsuario = Cookies.get('tipoUsuario'); // Pega o tipo do usuário

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

    // useEffect para redirecionar se o usuário não estiver logado
    useEffect(() => {
        if (!userId) {
            router.push('/login');
        } else if (!galeriaId || !condominioId) {
            // Se os IDs não estão na URL (ex: acesso direto sem o parâmetro)
            console.error("IDs de galeria ou condomínio não encontrados na URL.");
            setError("IDs de galeria ou condomínio não encontrados. Por favor, volte para a galeria principal.");
            setLoading(false);
        }
    }, [userId, galeriaId, condominioId, router]);

    // Função para buscar o nome do condomínio
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

    // Função para buscar o nome da galeria
    const fetchGaleriaNome = useCallback(async () => {
        if (!galeriaId) return;
        try {
            // Chamamos a API que lista todas as galerias de um condomínio
            // e então filtramos para encontrar a galeria específica pelo ID.
            // Isso evita a necessidade de um endpoint /api/galerias/:galeriaId específico por enquanto.
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


    // Função para buscar as fotos da galeria específica
    const fetchFotos = useCallback(async () => {
        // Só busca se ambos os IDs estiverem disponíveis
        if (!galeriaId || !condominioId) return; 

        setLoading(true);
        setError(null);
        try {
            // Chama a API do backend para listar fotos de uma galeria
            const response = await fetch(`http://localhost:5000/api/fotos/galeria/${galeriaId}`);
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
    }, [galeriaId, condominioId]); // Depende do galeriaId e condominioId para saber qual galeria buscar

    // useEffect principal para carregar dados quando os IDs estão disponíveis
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
        // Validação adicional: garante que o galeriaId e userId estejam disponíveis
        if (!selectedFile || !galeriaId || !userId) {
            alert('Por favor, selecione um arquivo de imagem e certifique-se de estar logado e com a galeria selecionada.');
            return;
        }

        setUploadLoading(true);
        setUploadError(null);

        const formData = new FormData();
        formData.append('file', selectedFile); // 'file' deve corresponder ao nome do campo no multer
        formData.append('descricao', fileDescription);
        formData.append('galeria_id', galeriaId); // Passa o ID da galeria
        formData.append('usuario_id', userId); // Passa o ID do usuário que faz o upload

        try {
            const response = await fetch('http://localhost:5000/api/fotos/upload', {
                method: 'POST',
                body: formData, // FormData define o Content-Type: multipart/form-data automaticamente
            });

            if (response.ok) {
                alert('Foto enviada com sucesso!');
                setShowUploadModal(false);
                setSelectedFile(null);
                setFileDescription('');
                fetchFotos(); // Recarrega a lista de fotos da galeria para exibir a nova
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


    return (
        <>
            <Head>
                {/* Título dinâmico da aba do navegador */}
                <title>{galeriaNome ? `${galeriaNome} - Fotos` : 'Fotos da Galeria'}</title>
            </Head>

            <div className="container mt-5">
                {/* Título principal da página */}
                <h1 className="mb-4">
                    Fotos da Galeria: {galeriaNome || 'Carregando...'} {condominioNome && `(${condominioNome})`}
                </h1>

                {/* Botões de Ação */}
                <div className="d-flex flex-wrap align-items-center mb-4">
                    <button
                        type="button"
                        className="btn btn-secondary me-2 mb-2"
                        // Volta para a página principal de galerias, passando o ID do condomínio
                        onClick={() => router.push(`/galeria?id=${condominioId}`)} 
                    >
                        Voltar para Galerias
                    </button>

                    {tipoUsuario === 'Administrador' && (
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

                {/* Mensagens de Carregamento/Erro/Vazio */}
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
                                            style={{ height: '200px', objectFit: 'cover' }}
                                        />
                                    )}
                                    <div className="card-body">
                                        <h5 className="card-title">{foto.descricao || 'Sem Descrição'}</h5>
                                        <p className="card-text text-muted" style={{ fontSize: '0.8rem' }}>
                                            Por: {foto.usuario ? foto.usuario.nome : 'N/A'} em {new Date(foto.criado_em).toLocaleDateString('pt-BR')}
                                        </p>
                                        {foto.status !== 'aprovada' && tipoUsuario === 'Administrador' && (
                                            <span className={`badge ${foto.status === 'pendente' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                                                {foto.status === 'pendente' ? 'Pendente' : 'Rejeitada'}
                                            </span>
                                        )}
                                        {/* Futuramente: Botões de aprovar/rejeitar/excluir para admin */}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL PARA UPLOAD DE FOTO (APENAS ADMIN) */}
            {showUploadModal && tipoUsuario === 'Administrador' && (
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
        </>
    );
}