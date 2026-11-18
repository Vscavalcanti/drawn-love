import { useEffect, useState } from 'react';
import Avatar from './Avatar.jsx';
import { Close, Back, Lock } from './Icons.jsx';
import { watchPortraits, setPortraitHidden } from '../services/api.js';

// "Desenhos de mim": os redesenhos que outras pessoas fizeram de alguém e que viraram match.
// Fica no perfil, logo abaixo do "Sobre mim". Só o dono e quem tem match com ele veem.
export default function PortraitGallery({ owner, editable = false, ownerName = '' }) {
  const [items, setItems] = useState(null);
  const [open, setOpen] = useState(-1);
  const [error, setError] = useState('');
  useEffect(() => watchPortraits(owner, setItems, (e) => setError(e.message)), [owner]);

  // quem visita não vê os escondidos
  const list = (items || []).filter((it) => editable || !it.hidden);
  const current = open >= 0 ? list[open] : null;

  useEffect(() => {
    if (open < 0 || !list.length) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(-1);
      if (e.key === 'ArrowRight') setOpen((i) => (i + 1) % list.length);
      if (e.key === 'ArrowLeft') setOpen((i) => (i + list.length - 1) % list.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, list.length]);

  const toggle = async () => {
    try { await setPortraitHidden(owner, current.id, !current.hidden); } catch (e) { setError(e.message); }
  };

  return (
    <div className="card col gap-12">
      <div className="row between gap-8">
        <div className="card-title">{editable ? 'Desenhos de mim' : `Desenhos de ${ownerName}`}</div>
        {list.length > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--cinza)' }}>{list.length}</span>}
      </div>
      <p className="art-note"><Lock size={14} />{editable ? 'Os redesenhos que viraram match. Só quem deu match com você vê.' : 'Redesenhos que viraram match. Só aparece depois do match.'}</p>

      {items === null && !error && <p className="sub" style={{ fontSize: 13, margin: 0 }}>Carregando desenhos…</p>}
      {items && list.length === 0 && (
        <p className="sub" style={{ fontSize: 14, margin: 0 }}>
          {editable ? 'Quando alguém redesenhar você e você aprovar, o desenho aparece aqui.' : `Ainda não tem desenhos de ${ownerName}.`}
        </p>
      )}

      {list.length > 0 && (
        <div className="photo-grid">
          {list.map((it, i) => (
            <button key={it.id} className={'photo-thumb art-thumb' + (it.hidden ? ' is-hidden' : '')} onClick={() => setOpen(i)}
              aria-label={`Desenho feito por ${it.byName}${it.hidden ? ' (escondido)' : ''}`}>
              <Drawing sent={it.sent} />
              <span className="photo-who">{it.byName}</span>
              {it.hidden && <span className="art-hidden-tag">escondido</span>}
            </button>
          ))}
        </div>
      )}

      {error && <div role="alert" className="error">{error}</div>}

      {current && (
        <div className="overlay art-overlay" role="dialog" aria-modal="true" aria-label={'Desenho feito por ' + current.byName}>
          <div className="row between gap-8" style={{ color: 'var(--creme)' }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{open + 1} de {list.length} · por {current.byName}</div>
            <div className="row gap-8">
              {editable && (
                <button className="pill" onClick={toggle} style={{ background: 'transparent', color: 'var(--creme)', borderColor: 'var(--creme)' }}>
                  {current.hidden ? 'Mostrar no perfil' : 'Esconder do perfil'}
                </button>
              )}
              <button className="icon-btn" aria-label="Fechar" onClick={() => setOpen(-1)} style={{ borderColor: 'var(--creme)', color: 'var(--creme)' }}><Close size={20} /></button>
            </div>
          </div>
          <div className="viewer"><div className="art-big"><Drawing sent={current.sent} /></div></div>
          <p style={{ margin: 0, textAlign: 'center', color: 'var(--creme)', fontSize: 14 }}>
            {current.sent?.mode === 'livre' ? 'Traço livre' : 'Com a base'} · {new Date(current.at).toLocaleDateString('pt-BR')}
          </p>
          {list.length > 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button className="btn" style={{ minHeight: 48, background: 'transparent', color: 'var(--creme)', border: '2px solid var(--creme)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                onClick={() => setOpen((open + list.length - 1) % list.length)}><Back />Anterior</button>
              <button className="btn" style={{ minHeight: 48, background: 'var(--creme)', color: 'var(--magenta)' }}
                onClick={() => setOpen((open + 1) % list.length)}>Próximo</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Drawing({ sent }) {
  if (sent?.mode === 'livre' && sent.image) return <img src={sent.image} alt="" draggable={false} onContextMenu={(e) => e.preventDefault()} />;
  if (sent?.avatar) return <div className="art-avatar"><Avatar a={sent.avatar} fit /></div>;
  return null;
}
