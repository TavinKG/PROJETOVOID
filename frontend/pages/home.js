import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import LogoutButton from '../components/LogoutButton';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const tipoUsuario = Cookies.get('tipoUsuario');
  const userId = Cookies.get('userId');
  
  const [welcomeMessage, setWelcomeMessage] = useState(null); 
  
  const [showModal, setShowModal] = useState(false); // Modal de criação de condomínio
  const [showIngressoModal, setShowIngressoModal] = useState(false); // Modal de ingresso em condomínio
  
  const [areasComuns, setAreasComuns] = useState([]);
  const [quantidadeAreas, setQuantidadeAreas] = useState(0);
  
  const [cnpjSearch, setCnpjSearch] = useState('');
  const [condominioEncontrado, setCondominioEncontrado] = useState(null);
  const [condominiosUsuario, setCondominiosUsuario] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false); // Novo estado para loading da busca
  const [searchAttempted, setSearchAttempted] = useState(false); // Novo estado para indicar que uma busca foi tentada

  const fetchCondominiosUsuario = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await fetch(`http://localhost:5000/api/usuariocondominio/${userId}/ativos`);
      if (response.ok) {
        const data = await response.json();
        setCondominiosUsuario(data.data);
      } else {
        console.error('Erro ao buscar condomínios do usuário:', response.statusText);
        setCondominiosUsuario([]);
      }
    } catch (error) {
      console.error('Erro ao buscar dados dos condomínios:', error);
      setCondominiosUsuario([]);
    }
  }, [userId]);

  const handleSearchCondominio = useCallback(async (cnpj) => {
    // Validação inicial: se o CNPJ está vazio, reseta os estados e não faz a busca
    if (cnpj.length === 0) {
      setCondominioEncontrado(null);
      setSearchAttempted(false);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    setSearchAttempted(true); // Marca que uma busca foi tentada
    try {
      const response = await fetch(`http://localhost:5000/api/condominios/buscar/${cnpj}`);
      if (response.ok) {
        const data = await response.json();
        setCondominioEncontrado(data);
      } else {
        setCondominioEncontrado(null); // Limpa o condomínio encontrado se a busca falhar
      }
    } catch (error) {
      console.error('Erro ao buscar condomínio:', error);
      setCondominioEncontrado(null); // Limpa o condomínio encontrado em caso de erro
    } finally {
      setSearchLoading(false); // Finaliza o loading
    }
  }, []); 


  useEffect(() => {
    if (!tipoUsuario || !userId) {
      router.push('/login');
    } else {
      fetchCondominiosUsuario();
    }
  }, [tipoUsuario, userId, router, fetchCondominiosUsuario]);

  // useEffect para definir a mensagem de boas-vindas
  useEffect(() => {
    if (tipoUsuario === 'Morador') {
      if (condominiosUsuario.length === 0) {
        setWelcomeMessage(
          <>
            Você ainda não está em nenhum condomínio. Por favor,{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); setShowIngressoModal(true); }}>
              entre em um condomínio
            </a>.
          </>
        );
      } else {
        setWelcomeMessage(
          <>
            Gerencie suas atividades e informações nos condomínios vinculados ou{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); setShowIngressoModal(true); }}>
              entre em outro condomínio
            </a>.
          </>
        );
      }
    } else if (tipoUsuario === 'Administrador') {
      setWelcomeMessage(
        <>
          Você pode{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); setShowIngressoModal(true); }}>
            entrar em um condomínio existente
          </a>{' '}
          ou{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); setShowModal(true); }}>
            criar o perfil para um novo condomínio
          </a>.
        </>
      );
    }
  }, [tipoUsuario, condominiosUsuario]);

  // O useEffect de debounce foi REMOVIDO daqui.

  const handleIngressarCondominio = async () => {
    try {
      if (!condominioEncontrado) {
        alert('Nenhum condomínio selecionado para ingresso.');
        return;
      }
  
      const usuarioCondominioData = {
        status: 0, // Status 0 para pendente/aguardando aprovação
        usuarioId: userId,
        condominioId: condominioEncontrado.id,
      };
  
      const response = await fetch('http://localhost:5000/api/usuariocondominio/vinculo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuarioCondominioData),
      });
  
      if (response.ok) {
        alert('Pedido de ingresso no condomínio realizado com sucesso! Aguarde a aprovação do administrador.');
        setShowIngressoModal(false);
        setCnpjSearch('');
        setCondominioEncontrado(null);
        setSearchAttempted(false);
      } else {
        const errorData = await response.json();
        alert(`Erro ao ingressar no condomínio: ${errorData.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao ingressar no condomínio:', error);
      alert('Erro ao realizar o ingresso.');
    }
  };
  
  const handleQuantidadeAreasChange = (e) => {
    const quantidade = parseInt(e.target.value, 10) || 0;
    setQuantidadeAreas(quantidade);

    const novasAreas = Array.from({ length: quantidade }, (_, index) => ({
      id: index,
      nome: '',
      disponibilidade: 'disponível',
    }));
    setAreasComuns(novasAreas);
  };

  const handleAreaChange = (index, field, value) => {
    const novasAreas = [...areasComuns];
    novasAreas[index][field] = value;
    setAreasComuns(novasAreas);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const condominioData = {
      nome: e.target.nome.value,
      cnpj: e.target.cnpj.value,
      endereco: e.target.endereco.value,
      areasComuns: areasComuns.map(area => ({
        nome: area.nome,
        disponibilidade: area.disponibilidade === 'disponível',
      })),
    };

    try {
      const response = await fetch('http://localhost:5000/api/condominios/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(condominioData),
      });

      if (response.ok) {
        const condominioCriado = await response.json();
        const condominioId = condominioCriado.id;

        const usuarioCondominioData = {
          status: 1, // Status de ativo para Administrador que cria o condomínio
          usuarioId: userId,
          condominioId: condominioId,
        };

        const vinculoResponse = await fetch('http://localhost:5000/api/usuariocondominio/vinculo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(usuarioCondominioData),
        });

        if (vinculoResponse.ok) {
          alert('Condomínio criado e vínculo estabelecido com sucesso!');
          setShowModal(false);
          fetchCondominiosUsuario();
        } else {
          const vinculoError = await vinculoResponse.json();
          alert(`Erro ao criar vínculo: ${vinculoError.message || 'Erro desconhecido'}`);
        }
      } else {
        const errorData = await response.json();
        alert(`Erro ao criar condomínio: ${errorData.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
      alert('Erro ao criar condomínio ou vínculo');
    }
  };

  return (
    <>
      <Head>
        <title>Home - PROJETO VOID</title>
      </Head>
      <div className="container mt-5">
        <h1 className="mb-4">Bem-vindo à Home!</h1>
        {welcomeMessage && <p className="lead">{welcomeMessage}</p>}

        {condominiosUsuario.length > 0 && (
          <div className="mt-4">
            <h2 className="mb-3">Seus Condomínios</h2>
            <div className="row">
              {condominiosUsuario.map(condominio => (
                <div key={condominio.id} className="col-md-6 col-lg-4 mb-4">
                  <Link href={`/condo?id=${condominio.id}`} className="text-decoration-none text-dark">
                    <div className="card h-100 shadow-sm">
                      <div className="card-body">
                        <h5 className="card-title">{condominio.nome}</h5>
                        <p className="card-text mb-1"><strong>CNPJ:</strong> {condominio.cnpj}</p>
                        <p className="card-text mb-0"><strong>Endereço:</strong> {condominio.endereco}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-5">
          <LogoutButton />
        </div>

        {showIngressoModal && (
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-labelledby="modalIngressoCondominio" aria-hidden="true" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="modalIngressoCondominio">Buscar ou Ingressar em um Condomínio</h5>
                  <button type="button" className="btn-close" aria-label="Close" onClick={() => { setShowIngressoModal(false); setCondominioEncontrado(null); setCnpjSearch(''); setSearchAttempted(false); }}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label" htmlFor="cnpjSearch">Buscar Condomínio pelo CNPJ</label>
                    <input
                      type="text"
                      id="cnpjSearch"
                      className="form-control"
                      value={cnpjSearch}
                      onChange={(e) => {
                        setCnpjSearch(e.target.value.replace(/\D/g, ''));
                        setCondominioEncontrado(null); // Limpa o condomínio encontrado ao digitar
                        setSearchAttempted(false); // Reseta a tentativa de busca
                      }}
                      placeholder="Digite o CNPJ (apenas números)"
                    />
                    <button className="btn btn-primary mt-2 w-100" onClick={() => handleSearchCondominio(cnpjSearch)} disabled={searchLoading}>
                      {searchLoading ? 'Buscando...' : 'Buscar'}
                    </button>
                  </div>

                  {condominioEncontrado && (
                    <div className="mt-3 p-3 border rounded bg-light">
                      <h5>Condomínio Encontrado:</h5>
                      <p className="mb-1"><strong>Nome:</strong> {condominioEncontrado.nome}</p>
                      <p className="mb-1"><strong>CNPJ:</strong> {condominioEncontrado.cnpj}</p>
                      <p className="mb-3"><strong>Endereço:</strong> {condominioEncontrado.endereco}</p>
                      <button className="btn btn-success w-100" onClick={handleIngressarCondominio}>Solicitar Ingresso</button>
                    </div>
                  )}

                  {!condominioEncontrado && searchAttempted && !searchLoading && cnpjSearch.length > 0 && (
                    <p className="text-warning text-center mt-3">Nenhum condomínio encontrado com o CNPJ informado.</p>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowIngressoModal(false); setCondominioEncontrado(null); setCnpjSearch(''); setSearchAttempted(false); }}>
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showModal && (
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-labelledby="modalCriacaoCondominio" aria-hidden="true" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="modalCriacaoCondominio">Criar Novo Condomínio</h5>
                  <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="nome" className="form-label">Nome do Condomínio</label>
                      <input type="text" id="nome" className="form-control" required placeholder="Ex: Condomínio Residencial Aurora" />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="cnpj" className="form-label">CNPJ</label>
                      <input type="text" id="cnpj" className="form-control" required placeholder="Ex: 00.000.000/0000-00" />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="endereco" className="form-label">Endereço</label>
                      <input type="text" id="endereco" className="form-control" required placeholder="Ex: Rua das Flores, 123 - Centro" />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="quantidadeAreas" className="form-label">Quantidade de Áreas Comuns</label>
                      <input
                        type="number"
                        id="quantidadeAreas"
                        className="form-control"
                        value={quantidadeAreas}
                        onChange={handleQuantidadeAreasChange}
                        min="0"
                        placeholder="Número de áreas como salão de festas, academia, etc."
                      />
                    </div>
                    {areasComuns.map((area, index) => (
                      <div key={index} className="mb-3 p-2 border rounded bg-light">
                        <label className="form-label d-block fw-bold">Área Comum {index + 1}</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Nome da área (Ex: Salão de Festas)"
                          value={area.nome}
                          onChange={(e) => handleAreaChange(index, 'nome', e.target.value)}
                          required
                        />
                        <select
                          className="form-control mt-2"
                          value={area.disponibilidade}
                          onChange={(e) => handleAreaChange(index, 'disponibilidade', e.target.value)}
                        >
                          <option value="disponível">Disponível</option>
                          <option value="indisponível">Indisponível</option>
                        </select>
                      </div>
                    ))}
                    <button type="submit" className="btn btn-primary mt-3 w-100">Criar Condomínio</button>
                  </form>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}