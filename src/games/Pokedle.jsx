import { useEffect, useMemo, useState } from 'react';
import { normalize } from '../data/words.js';
import { createGame, updateGame, otherOf } from '../services/api.js';
import { hide, reveal, GameHeader, TurnBar, ResultBar } from './common.jsx';

// Pokédle a dois: adivinhem o Pokémon pelas pistas, um chute de cada vez.
// Dados reais (tipos, geração, altura, peso, cor, estágio) vêm de src/data/pokemon.js.
const MAX = 10;
export const RANGES = [
  { id: 151, label: '1ª geração', sub: '151 Pokémon' },
  { id: 493, label: 'Gerações 1 a 4', sub: '493 Pokémon' },
  { id: 1025, label: 'Todas', sub: '1.025 Pokémon' },
];
const loadDex = () => import('../data/pokemon.js').then((m) => m.POKEMON);
const toObj = ([num, name, t1, t2, gen, h, w, color, stage]) => ({ num, name, t1, t2, gen, h, w, color, stage });

export async function startPokedle(match, uid, range) {
  const dex = (await loadDex()).filter((p) => p[0] <= range);
  const answer = dex[Math.floor(Math.random() * dex.length)][0];
  return createGame(match.id, uid, 'pokedle', uid, { answer: hide(String(answer)), range, guesses: [] }, 'Pokédle');
}

// Compara um chute com a resposta, coluna por coluna
function compare(g, a) {
  const num = (x, y) => (x === y ? { c: 'certo' } : { c: 'errado', arrow: x < y ? '↑' : '↓' });
  const typeCell = (t, other) => (t === (other === 1 ? a.t1 : a.t2) ? 'certo' : [a.t1, a.t2].includes(t) && t ? 'lugar' : 'errado');
  return {
    t1: { v: g.t1, c: typeCell(g.t1, 1) },
    t2: { v: g.t2 || 'Nenhum', c: (g.t2 || '') === (a.t2 || '') ? 'certo' : g.t2 && [a.t1, a.t2].includes(g.t2) ? 'lugar' : 'errado' },
    gen: { v: g.gen + 'ª', ...num(g.gen, a.gen) },
    h: { v: String(g.h).replace('.', ',') + ' m', ...num(g.h, a.h) },
    w: { v: String(g.w).replace('.', ',') + ' kg', ...num(g.w, a.w) },
    color: { v: g.color, c: g.color === a.color ? 'certo' : 'errado' },
    stage: { v: g.stage, ...num(g.stage, a.stage) },
  };
}
const COLS = [['t1', 'Tipo 1'], ['t2', 'Tipo 2'], ['gen', 'Geração'], ['h', 'Altura'], ['w', 'Peso'], ['color', 'Cor'], ['stage', 'Estágio']];

export default function Pokedle({ match, game, uid, names, onBack, onNew }) {
  const [dex, setDex] = useState(null);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { loadDex().then((d) => setDex(d.map(toObj))); }, []);

  const st = game.state;
  const answerNum = Number(reveal(st.answer));
  const guesses = st.guesses || [];
  const myTurn = game.status === 'playing' && game.turn === uid;
  const byNum = useMemo(() => (dex ? Object.fromEntries(dex.map((p) => [p.num, p])) : {}), [dex]);
  const answer = byNum[answerNum];

  const options = useMemo(() => {
    if (!dex || !q.trim()) return [];
    const n = normalize(q);
    const used = new Set(guesses.map((g) => g.num));
    return dex.filter((p) => p.num <= st.range && !used.has(p.num) && normalize(p.name).startsWith(n)).slice(0, 6);
  }, [dex, q, guesses, st.range]);

  const guess = async (p) => {
    if (!myTurn) return;
    setQ(''); setError('');
    const next = [...guesses, { num: p.num, by: uid }];
    const won = p.num === answerNum;
    try {
      await updateGame(match.id, game.id, {
        state: { guesses: next },
        status: won ? 'won' : next.length >= MAX ? 'lost' : 'playing',
        turn: otherOf(match, uid),
      });
    } catch (e) { setError(e.message); }
  };

  if (!dex) return <div className="game"><GameHeader title="Pokédle" onBack={onBack} /><p className="sub">Carregando Pokédex…</p></div>;

  return (
    <div className="game col gap-10">
      <GameHeader title="Pokédle" onBack={onBack} right={<span className="sub" style={{ fontSize: 12 }}>{guesses.length}/{MAX}</span>} />
      <TurnBar game={game} uid={uid} names={names} />

      {game.status === 'playing' && (
        <div className="pk-search">
          <label htmlFor="pk-q" className="sr-only">Nome do Pokémon</label>
          <input id="pk-q" className="input" value={q} onChange={(e) => setQ(e.target.value)} disabled={!myTurn} autoComplete="off" spellCheck={false}
            placeholder={myTurn ? 'Digite o nome de um Pokémon…' : `Esperando ${names?.[game.turn] || 'seu match'}…`}
            onKeyDown={(e) => e.key === 'Enter' && options[0] && guess(options[0])} />
          {options.length > 0 && (
            <ul className="pk-options" role="listbox">
              {options.map((p) => (
                <li key={p.num}><button role="option" aria-selected="false" onClick={() => guess(p)}>
                  <span className="pk-num">#{p.num}</span> {p.name}
                </button></li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && <div role="alert" className="error">{error}</div>}

      {game.status === 'won' && (
        <ResultBar action={<button className="pill on" onClick={onNew}>Jogar de novo</button>}>
          Acertaram! Era <strong>{answer?.name}</strong> (#{answerNum}) em {guesses.length} {guesses.length === 1 ? 'chute' : 'chutes'}.
        </ResultBar>
      )}
      {game.status === 'lost' && (
        <ResultBar tone="bad" action={<button className="pill on" onClick={onNew}>Tentar outro</button>}>
          Acabaram os chutes. Era <strong>{answer?.name}</strong> (#{answerNum}).
        </ResultBar>
      )}

      {guesses.length > 0 && answer && (
        <div className="pk-table-wrap">
          <table className="pk-table">
            <thead>
              <tr><th scope="col">Pokémon</th>{COLS.map(([k, l]) => <th key={k} scope="col">{l}</th>)}</tr>
            </thead>
            <tbody>
              {[...guesses].reverse().map((g) => {
                const p = byNum[g.num]; const r = compare(p, answer);
                return (
                  <tr key={g.num}>
                    <th scope="row" className="pk-name">{p.name}<span>{g.by === uid ? 'você' : (names?.[g.by] || '').split(' ')[0]}</span></th>
                    {COLS.map(([k]) => (
                      <td key={k} className={'pk-cell ' + r[k].c} aria-label={`${r[k].v}, ${r[k].c}${r[k].arrow ? r[k].arrow === '↑' ? ', é maior' : ', é menor' : ''}`}>
                        {r[k].v}{r[k].arrow && <span className="pk-arrow" aria-hidden="true">{r[k].arrow}</span>}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {guesses.length === 0 && game.status === 'playing' && (
        <p className="sub">Verde = igual. Amarelo = o tipo existe, mas na outra posição. ↑ / ↓ = o Pokémon certo tem número maior ou menor.</p>
      )}
    </div>
  );
}
