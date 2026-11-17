import { useCallback, useEffect, useState } from 'react';
import { TERMO_WORDS, normalize } from '../data/words.js';
import { createGame, getGame, updateGame, otherOf, today } from '../services/api.js';
import { hide, reveal, TurnBar, GameHeader, ResultBar } from './common.jsx';

// Termo a dois, do jeito clássico: UMA palavra por dia, diferente para cada conversa.
// Os chutes precisam existir no dicionário (src/data/termo-dict.js).
const MAX = 6;
const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
const loadDict = () => import('../data/termo-dict.js').then((m) => m.VALID);

// Embaralha a lista com uma "semente" da conversa: cada casal tem a própria ordem de palavras,
// e o dia escolhe a posição. Assim a palavra não repete por ~4 anos na mesma conversa.
function seeded(seedText) {
  let h = 2166136261;
  for (const ch of seedText) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function wordOfDay(matchId, dateKey) {
  const rand = seeded(matchId);
  const list = [...TERMO_WORDS];
  for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
  const day = Math.floor((Date.parse(dateKey + 'T12:00:00') - Date.parse('2026-01-01T12:00:00')) / 86400000);
  return list[((day % list.length) + list.length) % list.length];
}
export const termoIdFor = (dateKey) => 'termo-' + dateKey;

// Abre a partida de hoje; se ninguém começou ainda, cria (quem abre primeiro começa chutando)
export async function startTermo(match, uid) {
  const key = today(), id = termoIdFor(key);
  if (await getGame(match.id, id)) return id;
  return createGame(match.id, uid, 'termo', uid,
    { answer: hide(wordOfDay(match.id, key)), day: key, guesses: [] }, 'Termo a dois (palavra do dia)', id);
}

// Cores do Termo: certo (lugar certo), lugar (existe em outro lugar), errado
export function score(guess, answer) {
  const res = Array(5).fill('errado');
  const left = {};
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) res[i] = 'certo';
    else left[answer[i]] = (left[answer[i]] || 0) + 1;
  }
  for (let i = 0; i < 5; i++) {
    if (res[i] !== 'certo' && left[guess[i]]) { res[i] = 'lugar'; left[guess[i]]--; }
  }
  return res;
}

// Tempo até a próxima palavra (meia-noite)
function untilMidnight() {
  const now = new Date(), next = new Date(now); next.setHours(24, 0, 0, 0);
  const m = Math.ceil((next - now) / 60000);
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}min`;
}

export default function Termo({ match, game, uid, names, onBack }) {
  const [typed, setTyped] = useState('');
  const [error, setError] = useState('');
  const [dict, setDict] = useState(null);
  const [, tick] = useState(0);
  useEffect(() => { loadDict().then(setDict); }, []);
  useEffect(() => { const t = setInterval(() => tick((x) => x + 1), 30000); return () => clearInterval(t); }, []);

  const shown = reveal(game.state.answer).toUpperCase();   // com acento (para mostrar)
  const answer = normalize(shown);                       // sem acento (para comparar)
  const guesses = game.state.guesses || [];
  const myTurn = game.status === 'playing' && game.turn === uid;
  const isToday = (game.state.day || today()) === today();
  const dayLabel = (game.state.day || today()).split('-').reverse().slice(0, 2).join('/');

  // melhor cor já vista para cada letra (para o teclado)
  const keyColor = {};
  guesses.forEach((g) => score(g.w, answer).forEach((r, i) => {
    const k = g.w[i], rank = { errado: 1, lugar: 2, certo: 3 };
    if (!keyColor[k] || rank[r] > rank[keyColor[k]]) keyColor[k] = r;
  }));

  const submit = useCallback(async () => {
    if (!myTurn) return;
    const w = normalize(typed);
    if (!/^[A-Z]{5}$/.test(w)) { setError('A palavra precisa ter 5 letras.'); return; }
    if (!dict) { setError('Carregando o dicionário, tente de novo em um segundo.'); return; }
    if (!dict.has(w) && w !== answer) { setError('Essa palavra não está no dicionário.'); return; }
    if (guesses.some((g) => g.w === w)) { setError('Essa palavra já foi tentada.'); return; }
    const next = [...guesses, { w, by: uid }];
    const won = w === answer;
    const lost = !won && next.length >= MAX;
    setTyped(''); setError('');
    try {
      await updateGame(match.id, game.id, {
        state: { guesses: next },
        status: won ? 'won' : lost ? 'lost' : 'playing',
        turn: otherOf(match, uid),
      });
    } catch (e) { setError(e.message); setTyped(w); }
  }, [myTurn, typed, guesses, uid, answer, match, game, dict]);

  const press = useCallback((k) => {
    if (!myTurn) return;
    setError('');
    if (k === 'ENTER') submit();
    else if (k === 'BACK') setTyped((t) => t.slice(0, -1));
    else setTyped((t) => (t.length < 5 ? t + k : t));
  }, [myTurn, submit]);

  // teclado do computador
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea')) return;
      if (e.key === 'Enter') press('ENTER');
      else if (e.key === 'Backspace') press('BACK');
      else if (/^[a-zA-ZçÇ]$/.test(e.key)) press(normalize(e.key));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [press]);

  // Letra no lugar certo aparece com o acento da resposta (como no Termo)
  const display = (w, marks) => w.split('').map((l, i) => (marks[i] === 'certo' ? shown[i] : l));

  const rows = Array.from({ length: MAX }, (_, r) => {
    if (r < guesses.length) { const m = score(guesses[r].w, answer); return { letters: display(guesses[r].w, m), marks: m, by: guesses[r].by }; }
    if (r === guesses.length && game.status === 'playing') return { letters: typed.padEnd(5).split(''), marks: null, current: true };
    return { letters: '     '.split(''), marks: null };
  });

  const comeBack = isToday ? `Nova palavra em ${untilMidnight()}.` : 'Já tem uma palavra nova hoje: volte para a lista de jogos.';

  return (
    <div className="game col gap-10">
      <GameHeader title="Termo a dois" onBack={onBack} right={<span className="sub" style={{ fontSize: 12 }}>Palavra de {dayLabel}</span>} />
      <TurnBar game={game} uid={uid} names={names} />

      <div className="termo-board" role="grid" aria-label="Tabuleiro do Termo">
        {rows.map((row, r) => (
          <div key={r} className={'termo-row' + (row.current ? ' current' : '')} role="row">
            {row.letters.map((l, i) => (
              <div key={i} role="gridcell" className={'termo-tile ' + (row.marks ? row.marks[i] : l.trim() ? 'typed' : '')}
                aria-label={l.trim() ? `${l}${row.marks ? ', ' + row.marks[i] : ''}` : 'vazio'}>
                {l}
              </div>
            ))}
            {row.by && <span className="termo-by">{row.by === uid ? 'você' : (names?.[row.by] || '').split(' ')[0]}</span>}
          </div>
        ))}
      </div>

      {error && <div role="alert" className="error">{error}</div>}

      {game.status === 'won' && (
        <ResultBar>Acertaram juntos em {guesses.length} {guesses.length === 1 ? 'tentativa' : 'tentativas'}! A palavra era <strong>{shown}</strong>. {comeBack}</ResultBar>
      )}
      {game.status === 'lost' && (
        <ResultBar tone="bad">Não foi dessa vez. A palavra era <strong>{shown}</strong>. {comeBack}</ResultBar>
      )}

      {game.status === 'playing' && (
        <div className={'keyboard' + (myTurn ? '' : ' waiting')} aria-label="Teclado">
          {ROWS.map((row, i) => (
            <div key={row} className="kb-row">
              {i === 2 && <button className="kb-key wide" onClick={() => press('BACK')} disabled={!myTurn} aria-label="Apagar letra">Apagar</button>}
              {row.split('').map((k) => (
                <button key={k} className={'kb-key ' + (keyColor[k] || '')} onClick={() => press(k)} disabled={!myTurn}>{k}</button>
              ))}
              {i === 2 && <button className="kb-key wide enter" onClick={() => press('ENTER')} disabled={!myTurn}>Enviar</button>}
            </div>
          ))}
          {!myTurn && <p className="sub" style={{ textAlign: 'center', marginTop: 4 }}>Esperando {names?.[game.turn] || 'seu match'} chutar…</p>}
        </div>
      )}
    </div>
  );
}
