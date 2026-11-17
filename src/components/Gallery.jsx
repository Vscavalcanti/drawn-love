import { useEffect, useRef, useState } from 'react';
import { Photo, Close, Back } from './Icons.jsx';
import { watchPhotos, uploadPhoto, loadPhoto, deletePhoto, MAX_PHOTOS_EACH } from '../services/api.js';

// Galeria privada do match: as duas pessoas enviam fotos e só elas veem.
export default function Gallery({ matchId, uid, names, myName }) {
  const [photos, setPhotos] = useState(null);
  const [open, setOpen] = useState(-1);
  const [full, setFull] = useState({});       // id -> foto em tamanho grande (cache)
  const [sending, setSending] = useState(null); // { done, total }
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => watchPhotos(matchId, setPhotos, (e) => setError(e.message)), [matchId]);

  const mine = (photos || []).filter((p) => p.from === uid).length;
  const left = MAX_PHOTOS_EACH - mine;
  const current = open >= 0 && photos ? photos[open] : null;

  // Carrega a foto grande só quando ela é aberta
  useEffect(() => {
    if (!current || full[current.id]) return;
    let alive = true;
    loadPhoto(matchId, current.id).then((d) => { if (alive && d) setFull((f) => ({ ...f, [current.id]: d })); })
      .catch((e) => setError(e.message));
    return () => { alive = false; };
  }, [current, matchId, full]);

  // Teclado no visualizador: setas e Esc
  useEffect(() => {
    if (open < 0) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(-1);
      if (e.key === 'ArrowRight') setOpen((i) => (i + 1) % photos.length);
      if (e.key === 'ArrowLeft') setOpen((i) => (i + photos.length - 1) % photos.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, photos]);

  const pick = async (e) => {
    const files = [...e.target.files].slice(0, Math.max(0, left));
    e.target.value = '';
    if (!files.length) { if (left <= 0) setError(`Você já enviou ${MAX_PHOTOS_EACH} fotos. Apague uma para enviar outra.`); return; }
    setError('');
    for (let i = 0; i < files.length; i++) {
      setSending({ done: i, total: files.length });
      try { await uploadPhoto(matchId, uid, files[i]); } catch (er) { setError(er.message); break; }
    }
    setSending(null);
  };

  const remove = async () => {
    if (!current || !window.confirm('Apagar esta foto para vocês dois?')) return;
    const id = current.id;
    setOpen(-1);
    try { await deletePhoto(matchId, id); } catch (e) { setError(e.message); }
  };

  const who = (p) => (p.from === uid ? 'Você' : names?.[p.from] || '');

  return (
    <div className="scroll col gap-12" style={{ padding: '14px 16px 16px' }}>
      <p className="sub" style={{ fontSize: 12 }}>
        Só vocês dois veem estas fotos. Antes de enviar, o app diminui a foto e apaga a localização dela.
      </p>

      <input ref={inputRef} id="gallery-file" type="file" accept="image/*" multiple className="sr-only" onChange={pick} />
      <button className="btn btn-primary" disabled={!!sending || left <= 0} onClick={() => inputRef.current?.click()}
        style={{ minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Photo size={20} />
        {sending ? `Enviando ${sending.done + 1} de ${sending.total}…` : left > 0 ? `Adicionar fotos (${left} restantes)` : 'Limite de fotos atingido'}
      </button>

      {error && <div role="alert" className="error">{error}</div>}

      {photos === null && <p className="sub" style={{ textAlign: 'center' }}>Carregando fotos…</p>}
      {photos && photos.length === 0 && (
        <div className="col center gap-8" style={{ padding: '24px 8px', color: 'var(--cinza)' }}>
          <Photo size={40} />
          <p className="sub" style={{ maxWidth: 280 }}>A galeria está vazia. Vocês chegaram até aqui pela personalidade: agora podem mostrar quem são.</p>
        </div>
      )}

      {photos && photos.length > 0 && (
        <div className="photo-grid">
          {photos.map((p, i) => (
            <button key={p.id} className="photo-thumb" onClick={() => setOpen(i)} aria-label={`Foto ${i + 1}, enviada por ${who(p)}`}>
              <img src={p.thumb} alt="" draggable={false} onContextMenu={(e) => e.preventDefault()} />
              <span className="photo-who">{who(p)}</span>
            </button>
          ))}
        </div>
      )}

      {current && (
        <div className="overlay" role="dialog" aria-modal="true" aria-label="Foto da galeria">
          <div className="row between gap-8" style={{ color: 'var(--creme)' }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{open + 1} de {photos.length} · {who(current)}</div>
            <div className="row gap-8">
              {current.from === uid && (
                <button className="pill" onClick={remove} style={{ background: 'transparent', color: 'var(--creme)', borderColor: 'var(--creme)' }}>Apagar</button>
              )}
              <button className="icon-btn" aria-label="Fechar" onClick={() => setOpen(-1)} style={{ borderColor: 'var(--creme)', color: 'var(--creme)' }}><Close size={20} /></button>
            </div>
          </div>
          <div className="viewer">
            <img src={full[current.id] || current.thumb} alt={`Foto enviada por ${who(current)}`} draggable={false}
              onContextMenu={(e) => e.preventDefault()} style={{ filter: full[current.id] ? 'none' : 'blur(6px)' }} />
            <div className="watermark">Drawn Love · visto por {myName}</div>
          </div>
          {photos.length > 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button className="btn" style={{ minHeight: 48, background: 'transparent', color: 'var(--creme)', border: '2px solid var(--creme)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                onClick={() => setOpen((open + photos.length - 1) % photos.length)}><Back />Anterior</button>
              <button className="btn" style={{ minHeight: 48, background: 'var(--creme)', color: 'var(--magenta)' }}
                onClick={() => setOpen((open + 1) % photos.length)}>Próxima</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
