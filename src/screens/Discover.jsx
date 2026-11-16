import Avatar from '../components/Avatar.jsx';
import ProfileSections from '../components/ProfileSections.jsx';
import { Close, Star, Heart } from '../components/Icons.jsx';

// 3 · DESCUBRA: pessoas reais que já criaram o personagem.
export default function Discover({ person, loading, onPass, onLike, onRefresh }) {
  const header = (
    <div className="row between" style={{ padding: '16px 20px 10px' }}>
      <div className="logo mobile-only" style={{ fontSize: 26, transform: 'rotate(-3deg)' }}>DRAWN LOVE</div>
      <div className="step-tag" style={{ color: 'var(--magenta)' }}>3 · DESCUBRA</div>
    </div>
  );

  if (loading || !person) {
    return (
      <div className="screen">
        {header}
        <div className="grow col center gap-12" style={{ padding: 32 }}>
          {loading ? <p className="sub">Procurando pessoas...</p> : (
            <>
              <div style={{ fontSize: 20, fontWeight: 800 }}>Ninguém novo por aqui</div>
              <p className="sub" style={{ maxWidth: 320 }}>Você já viu todo mundo do teste. Quando mais pessoas criarem o perfil, elas aparecem aqui.</p>
              <button className="btn btn-secondary" style={{ maxWidth: 260 }} onClick={onRefresh}>Procurar de novo</button>
            </>
          )}
        </div>
      </div>
    );
  }

  const p = person.profile || {};
  return (
    <div className="screen">
      {header}
      <div className="scroll" style={{ padding: '0 16px 104px' }}>
        <div className="cols">
          <div className="col-a">
            <div className="portrait" style={{ height: 320, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 14, top: 14, fontSize: 11, fontWeight: 700, color: '#fff', background: 'rgba(58,46,74,0.6)', padding: '5px 10px', borderRadius: 999 }}>Autorretrato em 1 min</div>
              <Avatar a={person.me} width={260} />
            </div>
            <div className="row gap-8" style={{ alignItems: 'baseline', padding: '2px 4px' }}>
              <span style={{ fontSize: 30, fontWeight: 800 }}>{p.name}</span>
              <span style={{ fontSize: 24, fontWeight: 500, color: 'var(--cinza)' }}>{p.age}</span>
            </div>
            <div className="actions">
              <button className="round" aria-label="Passar" onClick={onPass} style={{ width: 62, height: 62, border: '3px solid var(--roxo)', background: '#fff', color: 'var(--roxo)' }}><Close /></button>
              <button className="round" aria-label="Super traço" onClick={onLike} style={{ width: 48, height: 48, border: '2px solid var(--azul)', background: '#fff', color: 'var(--azul)' }}><Star /></button>
              <button className="round" aria-label="Curtir e redesenhar" onClick={onLike} style={{ width: 62, height: 62, border: 'none', background: 'var(--magenta)', color: '#fff' }}><Heart /></button>
            </div>
          </div>
          <div className="col-b">
            <ProfileSections p={p} />
          </div>
        </div>
      </div>
    </div>
  );
}
