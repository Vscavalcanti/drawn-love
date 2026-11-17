import { useState } from 'react';
import Termo, { startTermo } from './Termo.jsx';
import DrawGuess, { startDrawGuess } from './DrawGuess.jsx';
import Pokedle, { startPokedle, RANGES } from './Pokedle.jsx';
import ChessGame, { startChess } from './ChessGame.jsx';
import { updateGame, today } from '../services/api.js';
import { termoIdFor } from './Termo.jsx';

export const GAMES = {
  termo: { title: 'Termo a dois', desc: 'A palavra do dia de vocês: 5 letras, 6 chutes, um de cada vez.', comp: Termo, color: '#C93A73' },
  desenho: { title: 'Desenha e adivinha', desc: 'Um desenha, o outro adivinha ao vivo. Depois troca.', comp: DrawGuess, color: '#735A96' },
  pokedle: { title: 'Pokédle', desc: 'Adivinhem o Pokémon pelas pistas de tipo, geração, altura e peso.', comp: Pokedle, color: '#3E6BAA' },
  xadrez: { title: 'Xadrez', desc: 'Uma partida em tempo real. Quem começa joga de brancas.', comp: ChessGame, color: '#3A2E4A' },
};

const STATUS = { won: 'Venceram', lost: 'Não deu', draw: 'Empate', ended: 'Encerrado' };

// Aba Jogos do chat: lista de jogos, jogo em andamento e histórico.
export default function GamesTab({ match, uid, names, games }) {
  const [openId, setOpenId] = useState(null);
  const [picking, setPicking] = useState(null); // escolhendo opções antes de começar (Pokédle)
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // O Termo do dia corre em paralelo; dos outros jogos, só um em andamento por vez
  const actives = (games || []).filter((g) => g.status === 'playing' && GAMES[g.type]);
  const active = actives.find((g) => g.type !== 'termo');
  const todayTermo = (games || []).find((g) => g.id === termoIdFor(today()));
  const open = games?.find((g) => g.id === openId);
  const recent = (games || []).filter((g) => g.status !== 'playing').slice(0, 5);

  const start = async (type, opt) => {
    setError('');
    if (type === 'termo') {
      setBusy(true);
      try { setOpenId(await startTermo(match, uid)); } catch (e) { setError(e.message); }
      setBusy(false);
      return;
    }
    if (active && !window.confirm(`Já tem um jogo em andamento (${GAMES[active.type].title}). Encerrar e começar outro?`)) return;
    setBusy(true);
    try {
      if (active) await updateGame(match.id, active.id, { status: 'ended' });
      const starters = { desenho: startDrawGuess, pokedle: (m, u) => startPokedle(m, u, opt), xadrez: startChess };
      const id = await starters[type](match, uid, opt);
      setPicking(null); setOpenId(id);
    } catch (e) { setError(e.message); }
    setBusy(false);
  };

  // "Jogar de novo" dentro de um jogo: mesmo tipo (no Desenha, quem desenha troca)
  const again = (g) => async (arg) => {
    setBusy(true);
    try {
      const id = g.type === 'desenho' ? await startDrawGuess(match, uid, arg)
        : g.type === 'pokedle' ? await startPokedle(match, uid, g.state.range)
          : await { termo: startTermo, xadrez: startChess }[g.type](match, uid);
      setOpenId(id);
    } catch (e) { setError(e.message); }
    setBusy(false);
  };

  if (open) {
    const Comp = GAMES[open.type].comp;
    return (
      <div className="scroll" style={{ padding: '12px 16px 16px' }}>
        <Comp match={match} game={open} uid={uid} names={names} onBack={() => setOpenId(null)} onNew={again(open)} />
      </div>
    );
  }

  return (
    <div className="scroll col gap-12" style={{ padding: '14px 16px 16px' }}>
      {error && <div role="alert" className="error">{error}</div>}

      {actives.map((g) => (
        <button key={g.id} className="game-active" onClick={() => setOpenId(g.id)}>
          <span className="game-badge" style={{ background: GAMES[g.type].color }} aria-hidden="true" />
          <span className="col" style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
            <strong>{GAMES[g.type].title}{g.type === 'termo' ? ' · palavra do dia' : ''}</strong>
            <span className="sub">{g.turn === uid ? 'É a sua vez' : `Vez de ${names?.[g.turn] || 'seu match'}`}</span>
          </span>
          <span className="pill on">Continuar</span>
        </button>
      ))}

      <div className="label">{actives.length ? 'Ou comecem outro' : 'Escolham um jogo para jogar juntos'}</div>
      <div className="game-grid">
        {Object.entries(GAMES).map(([type, g]) => (
          <div key={type} className="game-card" style={{ '--game': g.color }}>
            <div className="game-card-top" aria-hidden="true"><GameIcon type={type} /></div>
            <div className="col gap-6" style={{ flex: 1 }}>
              <strong style={{ fontSize: 15 }}>{g.title}</strong>
              <span className="sub" style={{ fontSize: 12 }}>{g.desc}</span>
            </div>
            {picking === type ? (
              <div className="col gap-6">
                {RANGES.map((r) => (
                  <button key={r.id} className="chip" disabled={busy} onClick={() => start('pokedle', r.id)}>{r.label} · {r.sub}</button>
                ))}
                <button className="btn-link" onClick={() => setPicking(null)}>Cancelar</button>
              </div>
            ) : (
              <button className="btn btn-primary" style={{ minHeight: 44, fontSize: 14, background: g.color }} disabled={busy}
                onClick={() => (type === 'pokedle' ? setPicking('pokedle') : start(type))}>
                {type === 'termo' && todayTermo ? (todayTermo.status === 'playing' ? 'Continuar' : 'Ver o de hoje') : 'Jogar'}
              </button>
            )}
          </div>
        ))}
      </div>

      {recent.length > 0 && (
        <div className="col gap-6">
          <div className="label">Últimos jogos</div>
          {recent.map((g) => (
            <button key={g.id} className="game-history" onClick={() => setOpenId(g.id)}>
              <span>{GAMES[g.type]?.title}</span><span className="sub">{STATUS[g.status] || ''}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Ícones simples de traço para cada jogo
function GameIcon({ type }) {
  const s = { fill: 'none', stroke: '#fff', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (type === 'termo') return (<svg width="30" height="30" viewBox="0 0 24 24"><rect x="2" y="7" width="6" height="6" rx="1.5" {...s} /><rect x="9" y="7" width="6" height="6" rx="1.5" {...s} /><rect x="16" y="7" width="6" height="6" rx="1.5" {...s} /><path d="M4 17h16" {...s} /></svg>);
  if (type === 'desenho') return (<svg width="30" height="30" viewBox="0 0 24 24"><path d="M3 21l3.5-1 11-11-2.5-2.5-11 11L3 21z" {...s} /><path d="M14 7.5L16.5 10" {...s} /></svg>);
  if (type === 'pokedle') return (<svg width="30" height="30" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" {...s} /><path d="M3 12h6M15 12h6" {...s} /><circle cx="12" cy="12" r="3" {...s} /></svg>);
  return (<svg width="30" height="30" viewBox="0 0 24 24"><path d="M8 21h8M9 18h6l-1-6h-4l-1 6zM10 12V9h4v3M9 6h6M12 3v3" {...s} /></svg>);
}
