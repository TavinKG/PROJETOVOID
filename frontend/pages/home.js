import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import LogoutButton from '../components/LogoutButton';
import InputMask from 'react-input-mask';

export default function Home() {
  const router = useRouter();
  const tipoUsuario = Cookies.get('tipoUsuario');
  const userId = Cookies.get('userId');
  const [mensagem, setMensagem] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showIngressoModal, setShowIngressoModal] = useState(false);
  const [areasComuns, setAreasComuns] = useState([]);
  const [quantidadeAreas, setQuantidadeAreas] = useState(0);
  const [cnpjSearch, setCnpjSearch] = useState('');
  const [condominioEncontrado, setCondominioEncontrado] = useState(null);
  const [condominiosUsuario, setCondominiosUsuario] = useState([]);
  const [condominioCnpjCadastro, setCondominioCnpjCadastro] = useState('');

  useEffect(() => {
    if (!tipoUsuario || !userId) {
      router.push('/login');
    } else {
      if (tipoUsuario === 'Morador') {
        setMensagem(
          <>
            Você ainda não está em nenhum condomínio. Por favor,{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); setShowIngressoModal(true); }} style={{color: '#4fc1e9'}}>
              entre em um condomínio
            </a>.
          </>
        );
      } else if (tipoUsuario === 'Administrador') {
        setMensagem(
          <>
            Você pode{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); setShowIngressoModal(true); }} style={{color: '#4fc1e9'}}>
              entrar em um condomínio existente
            </a>{' '}
            ou{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); setShowModal(true); }} style={{color: '#4fc1e9'}}>
              criar o perfil para um novo condomínio
            </a>.
          </>
        );
      }

      fetchCondominiosUsuario();
    }
  }, [tipoUsuario, userId, router]);

  const fetchCondominiosUsuario = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/usuariocondominio/${userId}/ativos`);
      if (response.ok) {
        const data = await response.json();
        console.log(data.data);
        setCondominiosUsuario(data.data);
      } else {
        console.error('Erro ao buscar condomínios do usuário');
      }
    } catch (error) {
      console.error('Erro ao buscar dados dos condomínios:', error);
    }
  };

  const handleSearchCondominio = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/condominios/buscar/${cnpjSearch}`);
      if (response.ok) {
        const data = await response.json();
        setCondominioEncontrado(data);
        alert('Condomínio encontrado com sucesso!');
      } else {
        alert('Condomínio não encontrado. Verifique o CNPJ.');
      }
    } catch (error) {
      console.error('Erro ao buscar condomínio:', error);
      alert('Erro ao buscar condomínio.');
    }
  };

  const handleIngressarCondominio = async () => {
    try {
      if (!condominioEncontrado) {
        alert('Nenhum condomínio selecionado para ingresso.');
        return;
      }
  
      const usuarioCondominioData = {
        status: 0,
        usuarioId: userId,
        condominioId: condominioEncontrado.id,
      };
  
      const response = await fetch('http://localhost:5000/api/usuariocondominio/vinculo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuarioCondominioData),
      });
  
      if (response.ok) {
        alert('Pedido de ingresso no condomínio realizado com sucesso!');
        setShowIngressoModal(false);
        fetchCondominiosUsuario();
      } else {
        const errorData = await response.json();
        alert(`Erro ao ingressar no condomínio: ${errorData.message}`);
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

    const rawCnpj = condominioCnpjCadastro.replace(/\D/g, '');
    if (rawCnpj.length !== 14) {
      alert('Por favor, digite um CNPJ válido com 14 dígitos.');
      return;
    }

    const condominioData = {
      nome: e.target.nome.value,
      cnpj: rawCnpj,
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
          status: 1,
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
        } else {
          const vinculoError = await vinculoResponse.json();
          alert(`Erro ao criar vínculo: ${vinculoError.message}`);
        }
      } else {
        const errorData = await response.json();
        alert(`Erro ao criar condomínio: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
      alert('Erro ao criar condomínio ou vínculo');
    }
  };

  const formatCnpj = (cnpj) => {
    if (!cnpj) return '';
    const rawCnpj = cnpj.replace(/\D/g, '');
    if (rawCnpj.length <= 2) return rawCnpj;
    if (rawCnpj.length <= 5) return `${rawCnpj.slice(0, 2)}.${rawCnpj.slice(2)}`;
    if (rawCnpj.length <= 8) return `${rawCnpj.slice(0, 2)}.${rawCnpj.slice(2, 5)}.${rawCnpj.slice(5)}`;
    if (rawCnpj.length <= 12) return `${rawCnpj.slice(0, 2)}.${rawCnpj.slice(2, 5)}.${rawCnpj.slice(5, 8)}/${rawCnpj.slice(8)}`;
    return `${rawCnpj.slice(0, 2)}.${rawCnpj.slice(2, 5)}.${rawCnpj.slice(5, 8)}/${rawCnpj.slice(8, 12)}-${rawCnpj.slice(12, 14)}`;
  };

  return (
    <div className="container mt-5">
    {}
    {(showModal || showIngressoModal) && (
      <div
        className="modal-backdrop fade show"
        style={{
          zIndex: 1040,
          backgroundColor: 'rgba(0,0,0,0.5)',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
        }}
      />
    )}
    <div className="container mt-5">
      <h1>Bem-vindo à Home!</h1>
      <p>{mensagem}</p>

      {}
      {condominiosUsuario.length > 0 ? (
        <div className="mt-4">
          <h2>Seus Condomínios</h2>
          {condominiosUsuario.map(condominio => (
            <a key={condominio.id} href={`condo?id=${condominio.id}`} className="text-decoration-none">
              <div className="card mb-3 rounded-4" style={{backgroundColor: 'rgb(3 7 18)', color: '#fff', border: '2px solid #4fc1e9'}}>
                <div className="card-body">
                  <h5 className="card-title">{condominio.nome}</h5>
                  <p className="card-text"><strong>CNPJ:</strong> {formatCnpj(condominio.cnpj)}</p>
                  <p className="card-text"><strong>Endereço:</strong> {condominio.endereco}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p>Você ainda não está vinculado a nenhum condomínio com status ativo.</p>
      )}

      <LogoutButton />

      {}
      {showIngressoModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-labelledby="modalIngressoCondominio" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered" role="document" >
            <div className="modal-content" style={{ backgroundColor: '#fff', color: 'rgb(3 7 18)' }}>
              <div className="modal-header">
                <h5 className="modal-title" id="modalIngressoCondominio">Buscar ou Ingressar em um Condomínio</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowIngressoModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label mb-2" htmlFor="cnpjSearch">Buscar Condomínio pelo CNPJ</label>
                  <input
                    type="text"
                    id="cnpjSearch"
                    className="form-control"
                    value={cnpjSearch}
                    onChange={(e) => setCnpjSearch(e.target.value)}
                    placeholder="Digite o CNPJ"
                    onFocus={(e) => {
                      e.target.style.boxShadow = 'none';
                      e.target.style.border = '2px solid #4fc1e9'
                    }}
                  />
                  <button className="btn btn-info mt-4 rounded-pill" onClick={handleSearchCondominio} style={{ color: '#fff', fontWeight: 'bold', color: 'rgb(3 7 18)'}}>Buscar</button>
                </div>

                {condominioEncontrado && (
                  <div className="mt-3">
                    <h5>Condomínio Encontrado:</h5>
                    <p><strong>Nome:</strong> {condominioEncontrado.nome}</p>
                    <p><strong>CNPJ:</strong> {formatCnpj(condominioEncontrado.cnpj)}</p>
                    <p><strong>Endereço:</strong> {condominioEncontrado.endereco}</p>
                    <button className="btn btn-info rounded-pill" onClick={handleIngressarCondominio} style={{fontWeight: 'bold'}}>Ingressar</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-labelledby="modalCriacaoCondominio" aria-hidden="true" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content" style={{color: "rgb(3 7 18)", fontWeight: 'bold'}}>
              <div className="modal-header">
                <h5 className="modal-title" id="modalCriacaoCondominio">Criar Condomínio</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="nome" className="form-label">Nome do Condomínio</label>
                    <input type="text" id="nome" className="form-control" required />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="cnpj" className="form-label">CNPJ</label>
                    <InputMask
                      type="text"
                      id="cnpj"
                      className="form-control"
                      mask="99.999.999/9999-99"
                      value={condominioCnpjCadastro}
                      onChange={(e) => setCondominioCnpjCadastro(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="endereco" className="form-label">Endereço</label>
                    <input type="text" id="endereco" className="form-control" required />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="quantidadeAreas" className="form-label">Quantidade de Áreas Comuns</label>
                    <input
                      type="number"
                      id="quantidadeAreas"
                      className="form-control"
                      value={quantidadeAreas}
                      onChange={handleQuantidadeAreasChange}
                      min="1"
                    />
                  </div>
                  {areasComuns.map((area, index) => (
                    <div key={area.id} className="mb-3">
                      <label className="form-label">Área Comum {index + 1}</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nome da área"
                        value={area.nome}
                        onChange={(e) => handleAreaChange(index, 'nome', e.target.value)}
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
                  <button type="submit" className="btn btn-info mt-3 mb-3 rounded-pill" style={{fontWeight: 'bold'}}>Criar Condomínio</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
