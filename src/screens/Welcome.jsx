import Avatar from '../components/Avatar.jsx';
import { BASES } from '../data/avatarOptions.js';
import Logo from '../components/Logo.jsx';

// Tela inicial: mostra logo de cara o que o app é (personagens desenhados, não fotos).
const DUO = [
  { ...BASES.f, hairStyle: 'cachos-longos', hair: '#4A2C22', skin: '#B97A52', shirt: '#F7D046', accent: '#C93A73', acc: 'flor', hat: '#F26B91', eyes: 'apaixonado', mouth: 'aberto' },
  { ...BASES.m, hairStyle: 'lateral', hair: '#2B2B2B', skin: '#F6D3B8', shirt: '#7BA3D6', accent: '#22335E', acc: 'nenhum', eyes: 'feliz', mouth: 'dentes' },
];

export default function Welcome({ go }) {
  return (
    <div className="screen narrow scroll">
      <div className="col center gap-16" style={{ minHeight: '100%', padding: '24px 28px' }}>
        <div className="welcome-duo" aria-hidden="true">
          <div className="welcome-card" style={{ transform: 'rotate(-6deg)' }}><Avatar a={DUO[0]} fit /></div>
          <div className="welcome-card" style={{ transform: 'rotate(5deg)', background: 'var(--azul)' }}><Avatar a={DUO[1]} fit /></div>
        </div>
        <h1 style={{ margin: '4px 0 0' }}><Logo size={92} nameSize={26} /></h1>
        <p style={{ margin: 0, color: 'var(--tinta)', fontSize: 16, fontWeight: 600, maxWidth: 300 }}>
          Namoro sem fotos: você se desenha, e o match começa redesenhando a outra pessoa.
        </p>
        <div className="col gap-12" style={{ width: '100%', marginTop: 8 }}>
          <button className="btn btn-primary" onClick={() => go('create')}>Criar perfil</button>
          <button className="btn btn-secondary" onClick={() => go('login')}>Entrar</button>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--roxo)' }}>18+ · Fotos só depois de 15 dias de conversa de verdade</p>
      </div>
    </div>
  );
}
