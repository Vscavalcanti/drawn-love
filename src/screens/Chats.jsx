import { useState } from 'react';
import Avatar from '../components/Avatar.jsx';
import SentDrawing from '../components/SentDrawing.jsx';
import { streakInfo } from '../services/api.js';
import { PresenceDot } from '../components/Presence.jsx';

// Lista de conversas + redesenhos recebidos esperando aprovação.
export default function Chats({ uid, incoming, matches, activeId, onOpen, onAnswer }) {
  const [viewing, setViewing] = useState(null);
  const [busy, setBusy] = useState(false);

  const answer = async (accept) => {
    setBusy(true);
    try { await onAnswer(viewing, accept); setViewing(null); } finally { setBusy(false); }
  };

  return (
    <div className="screen scroll pad col gap-16" style={{ position: 'relative' }}>
      <h1 className="h1" style={{ fontSize: 30 }}>Conversas</h1>

      {incoming.length > 0 && (
        <div className="col gap-8">
          <div className="label">Traços recebidos ({incoming.length})</div>
          {incoming.map((l) => (
            <button key={l.id} onClick={() => setViewing(l)} className="row gap-12"
              style={{ padding: 12, borderRadius: 20, border: '2px dashed var(--magenta)', background: 'rgba(242,107,145,0.08)', textAlign: 'left', color: 'var(--tinta)' }}>
              <Thumb av={l.fromAv} />
              <div className="col grow" style={{ minWidth: 0, gap: 2 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{l.fromName}</div>
                <div style={{ fontSize: 13, color: 'var(--cinza)' }}>Redesenhou você. Toque para ver.</div>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="col gap-8">
        {matches.map((m) => {
          const other = m.users.find((u) => u !== uid);
          const s = streakInfo(m, uid);
          return (
            <button key={m.id} onClick={() => onOpen(m.id)} className="row gap-12"
              style={{ padding: 12, borderRadius: 20, border: '2px solid ' + (activeId === m.id ? 'var(--magenta)' : 'rgba(115,90,150,0.25)'), background: '#fff', textAlign: 'left', color: 'var(--tinta)' }}>
              <div className="with-dot"><Thumb av={m.avs?.[other]} /><PresenceDot uid={other} size={16} /></div>
              <div className="col grow" style={{ minWidth: 0, gap: 2 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{m.names?.[other]}</div>
                <div style={{ fontSize: 13, color: 'var(--cinza)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {m.last ? (m.last.from === uid ? 'Você: ' : '') + m.last.text : 'Diga oi!'}
                </div>
              </div>
              <div style={{ flex: 'none', fontSize: 12, fontWeight: 700, color: 'var(--magenta)', background: 'rgba(201,58,115,0.1)', padding: '6px 10px', borderRadius: 999 }}>{s.unlocked ? 'Galeria aberta' : `Dia ${s.streak}/15`}</div>
            </button>
          );
        })}
      </div>

      {matches.length === 0 && incoming.length === 0 && (
        <p className="sub">Nenhuma conversa ainda. Quando alguém aprovar o seu traço, ou você aprovar o traço de alguém, a conversa aparece aqui.</p>
      )}

      {viewing && (
        <div className="overlay" style={{ background: 'rgba(30,23,38,0.92)', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--creme)' }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{viewing.fromName} redesenhou você</div>
          <div className="row gap-12" style={{ justifyContent: 'center' }}>
            <SentDrawing sent={viewing.sent} label="O traço" light width={150} height={170} />
            <div className="col center gap-6">
              <div style={{ width: 150, height: 170, borderRadius: 22, border: '3px solid var(--creme)', background: 'var(--rosa)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden' }}>
                <Avatar a={viewing.fromAv} width={144} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Autorretrato de {viewing.fromName}</span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 15 }}>Essa pessoa captou a sua essência?</p>
          <div className="col gap-10" style={{ width: '100%', maxWidth: 360 }}>
            <button className="btn btn-primary" disabled={busy} onClick={() => answer(true)}>Captou! Dar match</button>
            <button className="btn" disabled={busy} style={{ background: 'transparent', color: 'var(--creme)', border: '2px solid var(--creme)' }} onClick={() => answer(false)}>Não captou</button>
            <button className="btn-link" style={{ color: 'var(--creme)', minHeight: 44 }} onClick={() => setViewing(null)}>Decidir depois</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Thumb({ av }) {
  return (
    <div style={{ width: 56, height: 56, flex: 'none', borderRadius: 999, background: 'var(--rosa)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden' }}>
      {av && <Avatar a={av} width={56} />}
    </div>
  );
}
