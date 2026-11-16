import { useEffect, useRef, useState } from 'react';
import Avatar from '../components/Avatar.jsx';
import Mascot from '../components/Mascot.jsx';
import { Back, Send, Lock, Photo, Close } from '../components/Icons.jsx';
import { watchMessages, sendMessage, unlockDemo, streakInfo, MIN_CHARS } from '../services/api.js';

const MOOD_STYLE = {
  ok: { color: '#C93A73', bg: 'rgba(242,107,145,0.18)' },
  espera: { color: '#735A96', bg: 'rgba(115,90,150,0.10)' },
  pendente: { color: '#735A96', bg: 'rgba(115,90,150,0.10)' },
  curta: { color: '#9A5A00', bg: 'rgba(232,176,75,0.20)' },
  zerou: { color: '#3E6BAA', bg: 'rgba(62,107,170,0.12)' },
};
const PHOTOS = ['#F26B91', '#735A96', '#3E6BAA', '#C98A2B', '#C93A73', '#5B86C2'];

// Conversa em tempo real. O dia conta para a sequência quando AS DUAS pessoas
// mandam pelo menos uma mensagem de verdade (regra provisória: 25+ caracteres, no lugar da IA).
export default function Chat({ match, uid, myName, back }) {
  const [msgs, setMsgs] = useState([]);
  const [tab, setTab] = useState('conversa');
  const [draft, setDraft] = useState('');
  const [short, setShort] = useState(false);
  const [photo, setPhoto] = useState(-1);
  const [error, setError] = useState('');
  const endRef = useRef(null);

  const other = match.users.find((u) => u !== uid);
  const name = match.names?.[other] || '';
  const s = streakInfo(match, uid);
  const state = s.state !== 'ok' && short ? 'curta' : s.state;
  const moodText = {
    ok: 'Hoje validado: vocês dois conversaram de verdade!',
    espera: `Sua parte de hoje valeu. Falta ${name} mandar uma mensagem de verdade.`,
    pendente: 'Conversem de verdade hoje para manter a sequência.',
    curta: 'Mensagens curtas não contam. Capricha!',
    zerou: 'A sequência zerou. Recomecem hoje!',
  }[state];
  const mood = MOOD_STYLE[state];

  useEffect(() => watchMessages(match.id, setMsgs), [match.id]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [msgs.length, tab]);

  const send = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft(''); setError('');
    setShort(text.length < MIN_CHARS);
    try { await sendMessage(match.id, uid, text); } catch (e) { setError(e.message); setDraft(text); }
  };

  return (
    <div className="screen">
      <div className="row gap-12" style={{ padding: '16px 16px 10px' }}>
        <button className="icon-btn mobile-only" aria-label="Voltar" onClick={back}><Back /></button>
        <div style={{ width: 44, height: 44, flex: 'none', borderRadius: 999, background: 'var(--rosa)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden' }}>
          {match.avs?.[other] && <Avatar a={match.avs[other]} width={44} />}
        </div>
        <div style={{ fontWeight: 800, fontSize: 20 }}>{name}</div>
      </div>

      {/* Mascote da sequência: o lápis desenha o coração conforme os dias passam */}
      <div className="card row gap-12" style={{ margin: '0 16px', padding: '10px 14px', background: mood.bg }}>
        <div style={{ flex: 'none' }}><Mascot progress={s.unlocked ? 15 : s.streak} mood={state} size={68} /></div>
        <div className="col grow gap-6" style={{ minWidth: 0 }}>
          <div className="row gap-6" style={{ alignItems: 'baseline' }}>
            <span className="display" style={{ fontSize: 22, color: mood.color }}>{s.unlocked ? 15 : s.streak}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: mood.color }}>de 15 dias</span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: mood.color }}>{moodText}</div>
          <div className="dots">{Array.from({ length: 15 }, (_, i) => <div key={i} className={i < s.streak || s.unlocked ? 'on' : ''} />)}</div>
        </div>
      </div>

      <div className="segment" style={{ margin: '12px 16px 0' }}>
        <button className={tab === 'conversa' ? 'on' : ''} onClick={() => setTab('conversa')}>Conversa</button>
        <button className={tab === 'galeria' ? 'on' : ''} onClick={() => setTab('galeria')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          {!s.unlocked && <Lock />}Galeria
        </button>
      </div>

      {tab === 'conversa' && (
        <>
          <div className="scroll col gap-8" style={{ padding: '14px 16px' }}>
            {msgs.length === 0 && <p className="sub" style={{ textAlign: 'center' }}>Comece a conversa. Fale de você, não da aparência.</p>}
            {msgs.map((m) => <div key={m.id} className={'bubble ' + (m.from === uid ? 'me' : 'them')}>{m.text}</div>)}
            <div ref={endRef} />
          </div>
          {error && <div role="alert" className="error" style={{ margin: '0 16px 8px' }}>{error}</div>}
          <div className="row gap-8" style={{ padding: '0 16px 12px' }}>
            <label htmlFor="msg" className="sr-only">Mensagem</label>
            <input id="msg" className="input grow" style={{ borderRadius: 999, height: 48, minWidth: 0 }} value={draft}
              onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Escreva algo de verdade..." />
            <button aria-label="Enviar" onClick={send} style={{ width: 48, height: 48, flex: 'none', borderRadius: 999, border: 'none', background: 'var(--magenta)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Send /></button>
          </div>
        </>
      )}

      {tab === 'galeria' && !s.unlocked && (
        <div className="grow col center gap-12" style={{ padding: 24 }}>
          <div style={{ width: 84, height: 84, borderRadius: 999, background: 'rgba(115,90,150,0.12)', color: 'var(--roxo)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Lock size={38} /></div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Galeria bloqueada</div>
          <p className="sub" style={{ fontSize: 14 }}>Faltam <strong style={{ color: 'var(--magenta)' }}>{15 - s.streak} dias</strong> de conversa de verdade. Se um dia não contar, a sequência zera.</p>
          {/* Atalho para a apresentação: libera a galeria sem esperar 15 dias */}
          <button className="pill dashed" onClick={() => unlockDemo(match.id)}>Demo: liberar galeria</button>
        </div>
      )}

      {tab === 'galeria' && s.unlocked && (
        <div className="scroll col gap-10" style={{ padding: '14px 16px' }}>
          <p className="sub" style={{ fontSize: 12 }}>Só vocês dois veem estas fotos. (No teste, os quadrados ocupam o lugar das fotos.)</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {PHOTOS.map((c, i) => (
              <button key={i} aria-label={'Foto ' + (i + 1)} onClick={() => setPhoto(i)}
                style={{ aspectRatio: '3 / 4', borderRadius: 14, border: 'none', background: c, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, fontWeight: 600 }}>
                <Photo />Foto {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {photo >= 0 && (
        <div className="overlay">
          <div className="row between" style={{ color: 'var(--creme)' }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Foto {photo + 1} de {PHOTOS.length}</div>
            <button className="icon-btn" aria-label="Fechar" onClick={() => setPhoto(-1)} style={{ borderColor: 'var(--creme)', color: 'var(--creme)' }}><Close size={20} /></button>
          </div>
          <div className="grow" style={{ minHeight: 0, borderRadius: 22, background: PHOTOS[photo], position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Photo size={72} />
            <div style={{ position: 'absolute', bottom: 14, right: 14, fontSize: 11, fontWeight: 600, opacity: 0.85 }}>Drawn Love · visto por {myName}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button className="btn" style={{ minHeight: 48, background: 'transparent', color: 'var(--creme)', border: '2px solid var(--creme)' }} onClick={() => setPhoto((photo + PHOTOS.length - 1) % PHOTOS.length)}>Anterior</button>
            <button className="btn" style={{ minHeight: 48, background: 'var(--creme)', color: 'var(--magenta)' }} onClick={() => setPhoto((photo + 1) % PHOTOS.length)}>Próxima</button>
          </div>
        </div>
      )}
    </div>
  );
}
