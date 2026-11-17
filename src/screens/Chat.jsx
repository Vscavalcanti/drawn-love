import { useEffect, useRef, useState } from 'react';
import Avatar from '../components/Avatar.jsx';
import Mascot from '../components/Mascot.jsx';
import { Back, Send, Lock } from '../components/Icons.jsx';
import Gallery from '../components/Gallery.jsx';
import GamesTab from '../games/GamesTab.jsx';
import { watchMessages, sendMessage, simulateStreak, streakInfo, watchGames, MIN_CHARS } from '../services/api.js';

const MOOD_STYLE = {
  ok: { color: '#C93A73', bg: 'rgba(242,107,145,0.18)' },
  espera: { color: '#735A96', bg: 'rgba(115,90,150,0.10)' },
  pendente: { color: '#735A96', bg: 'rgba(115,90,150,0.10)' },
  curta: { color: '#9A5A00', bg: 'rgba(232,176,75,0.20)' },
  zerou: { color: '#3E6BAA', bg: 'rgba(62,107,170,0.12)' },
};

// Conversa em tempo real. O dia conta para a sequência quando AS DUAS pessoas
// mandam pelo menos uma mensagem de verdade (regra provisória: 25+ caracteres, no lugar da IA).
export default function Chat({ match, uid, myName, back }) {
  const [msgs, setMsgs] = useState([]);
  const [games, setGames] = useState(null);
  const [tab, setTab] = useState('conversa');
  const [draft, setDraft] = useState('');
  const [short, setShort] = useState(false);
  const [error, setError] = useState('');
  const [testOpen, setTestOpen] = useState(false);
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
  const mood = MOOD_STYLE[s.unlocked ? 'ok' : state];
  const moodLine = s.unlocked ? 'Coração completo! A galeria de vocês está aberta.' : moodText;

  useEffect(() => watchMessages(match.id, setMsgs), [match.id]);
  useEffect(() => watchGames(match.id, setGames, (e) => setError(e.message)), [match.id]);
  const myGameTurn = (games || []).some((g) => g.status === 'playing' && g.turn === uid);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [msgs.length, tab]);

  const simulate = async (n) => {
    setError('');
    try { await simulateStreak(match, n); } catch (e) { setError(e.message); }
  };

  // Atalho de teste para a apresentação: pula a sequência para 5, 10 ou 15 dias (ou zera).
  const testBar = (
    <div className="test-bar" role="group" aria-label="Teste: acelerar sequência">
      <span>Teste:</span>
      {[5, 10, 15].map((n) => (
        <button key={n} className={'pill dashed' + (s.streak === n && !match.demoUnlocked ? ' on' : '')} onClick={() => simulate(n)}>{n} dias</button>
      ))}
      <button className="pill dashed" onClick={() => simulate(0)}>Zerar</button>
    </div>
  );

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

      {/* Mascote da sequência: o lápis desenha o coração conforme os dias passam (escondido na aba Jogos, para sobrar espaço) */}
      {tab !== 'jogos' && <div className="card row gap-12" style={{ margin: '0 16px', padding: '10px 14px', background: mood.bg }}>
        <div style={{ flex: 'none' }}><Mascot progress={s.unlocked ? 15 : s.streak} mood={s.unlocked ? 'ok' : state} size={68} /></div>
        <div className="col grow gap-6" style={{ minWidth: 0 }}>
          <div className="row gap-6" style={{ alignItems: 'baseline' }}>
            <span className="display" style={{ fontSize: 22, color: mood.color }}>{s.unlocked ? 15 : s.streak}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: mood.color }}>de 15 dias</span>
            <button className="test-toggle" aria-expanded={testOpen} onClick={() => setTestOpen((v) => !v)}>⚡ Acelerar</button>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: mood.color }}>{moodLine}</div>
          <div className="dots">{Array.from({ length: 15 }, (_, i) => <div key={i} className={i < s.streak || s.unlocked ? 'on' : ''} />)}</div>
          {testOpen && testBar}
        </div>
      </div>}

      <div className="segment three" style={{ margin: '12px 16px 0' }} role="tablist">
        <button role="tab" aria-selected={tab === 'conversa'} className={tab === 'conversa' ? 'on' : ''} onClick={() => setTab('conversa')}>Conversa</button>
        <button role="tab" aria-selected={tab === 'jogos'} className={tab === 'jogos' ? 'on' : ''} onClick={() => setTab('jogos')} style={{ position: 'relative' }}>
          Jogos{myGameTurn && <span className="tab-dot" aria-label="é a sua vez" />}
        </button>
        <button role="tab" aria-selected={tab === 'galeria'} className={tab === 'galeria' ? 'on' : ''} onClick={() => setTab('galeria')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          {!s.unlocked && <Lock />}Galeria
        </button>
      </div>

      {tab === 'conversa' && (
        <>
          <div className="scroll col gap-8" style={{ padding: '14px 16px' }}>
            {msgs.length === 0 && <p className="sub" style={{ textAlign: 'center' }}>Comece a conversa. Fale de você, não da aparência.</p>}
            {msgs.map((m) => (m.kind === 'system'
              ? <button key={m.id} className="system-msg" onClick={() => setTab('jogos')}>{m.from === uid ? 'Você' : name}: {m.text}</button>
              : <div key={m.id} className={'bubble ' + (m.from === uid ? 'me' : 'them')}>{m.text}</div>))}
            <div ref={endRef} />
          </div>
          {error && <div role="alert" className="error" style={{ margin: '0 16px 8px' }}>{error}</div>}
          <div className="row gap-8" style={{ padding: '0 16px 12px' }}>
            <label htmlFor="msg" className="sr-only">Mensagem</label>
            <input id="msg" className="input grow" style={{ borderRadius: 999, height: 48, minWidth: 0 }} maxLength={1000} value={draft}
              onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Escreva algo de verdade..." />
            <button aria-label="Enviar" onClick={send} style={{ width: 48, height: 48, flex: 'none', borderRadius: 999, border: 'none', background: 'var(--magenta)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Send /></button>
          </div>
        </>
      )}

      {tab === 'jogos' && <GamesTab match={match} uid={uid} names={match.names} games={games} />}

      {tab === 'galeria' && !s.unlocked && (
        <div className="grow col center gap-12" style={{ padding: 24 }}>
          <div style={{ width: 84, height: 84, borderRadius: 999, background: 'rgba(115,90,150,0.12)', color: 'var(--roxo)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Lock size={38} /></div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Galeria bloqueada</div>
          <p className="sub" style={{ fontSize: 14 }}>Faltam <strong style={{ color: 'var(--magenta)' }}>{15 - s.streak} dias</strong> de conversa de verdade. Se um dia não contar, a sequência zera.</p>
          {testBar}
        </div>
      )}

      {tab === 'galeria' && s.unlocked && (
        <Gallery matchId={match.id} uid={uid} names={match.names} myName={myName} />
      )}
    </div>
  );
}
