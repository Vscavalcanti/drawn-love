import { useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import { createGame, updateGame, otherOf } from '../services/api.js';
import { GameHeader, TurnBar, ResultBar } from './common.jsx';

// Xadrez em tempo real. Regras completas (xeque, roque, en passant, empate) pela biblioteca chess.js.
// Quem cria a partida joga de brancas. Promoção de peão vira dama automaticamente.
export const startChess = (match, uid) =>
  createGame(match.id, uid, 'xadrez', uid,
    { fen: new Chess().fen(), white: uid, black: otherOf(match, uid), moves: [], last: null, result: '' }, 'Xadrez');

const GLYPH = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };
const NAME = { k: 'rei', q: 'dama', r: 'torre', b: 'bispo', n: 'cavalo', p: 'peão' };
const FILES = 'abcdefgh';

export default function ChessGame({ match, game, uid, names, onBack, onNew }) {
  const st = game.state;
  const chess = useMemo(() => new Chess(st.fen), [st.fen]);
  const [sel, setSel] = useState(null);
  const [error, setError] = useState('');
  const myColor = st.white === uid ? 'w' : 'b';
  const myTurn = game.status === 'playing' && chess.turn() === myColor;
  const flip = myColor === 'b';
  const targets = useMemo(() => (sel ? chess.moves({ square: sel, verbose: true }).map((m) => m.to) : []), [sel, chess]);
  const nameOf = (id) => (id === uid ? 'Você' : names?.[id] || 'Seu match');
  const colorOf = (id) => (id === st.white ? 'brancas' : 'pretas');
  const resultText = (r) => {
    if (!r || typeof r === 'string') return r || 'Partida encerrada.';
    if (r.how === 'draw') return 'Empate.';
    const won = r.winner === uid;
    if (r.how === 'mate') return won ? `Xeque-mate! Você venceu de ${colorOf(uid)}.` : `Xeque-mate! ${nameOf(r.winner)} venceu de ${colorOf(r.winner)}.`;
    return won ? `${nameOf(otherOf(match, uid))} desistiu. Você venceu!` : `Você desistiu. ${nameOf(r.winner)} venceu.`;
  };

  // quadrado do rei em xeque
  let checkSq = null;
  if (chess.inCheck()) {
    chess.board().forEach((row) => row.forEach((p) => { if (p && p.type === 'k' && p.color === chess.turn()) checkSq = p.square; }));
  }

  const move = async (from, to) => {
    const c = new Chess(st.fen);
    let m;
    try { m = c.move({ from, to, promotion: 'q' }); } catch { setSel(null); return; }
    setSel(null); setError('');
    // o resultado é gravado de forma neutra (quem venceu e como); cada tela monta a própria frase
    let status = 'playing', result = '';
    if (c.isCheckmate()) { status = 'won'; result = { how: 'mate', winner: uid }; }
    else if (c.isDraw() || c.isStalemate()) { status = 'draw'; result = { how: 'draw' }; }
    try {
      await updateGame(match.id, game.id, {
        state: { fen: c.fen(), moves: [...(st.moves || []), m.san], last: { from, to }, result },
        status, turn: otherOf(match, uid),
      });
    } catch (e) { setError(e.message); }
  };

  const tap = (sq) => {
    if (!myTurn) return;
    const p = chess.get(sq);
    if (sel && targets.includes(sq)) { move(sel, sq); return; }
    if (p && p.color === myColor) setSel(sq === sel ? null : sq);
    else setSel(null);
  };

  const resign = async () => {
    if (!window.confirm('Desistir da partida?')) return;
    await updateGame(match.id, game.id, { status: 'ended', state: { result: { how: 'resign', winner: otherOf(match, uid) } } });
  };

  const ranks = flip ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const files = flip ? FILES.split('').reverse() : FILES.split('');

  return (
    <div className="game col gap-10">
      <GameHeader title="Xadrez" onBack={onBack}
        right={game.status === 'playing' && <button className="pill dashed" onClick={resign}>Desistir</button>} />
      <TurnBar game={game} uid={uid} names={names}>
        {myTurn ? `Sua vez (${myColor === 'w' ? 'brancas' : 'pretas'})${chess.inCheck() ? ' · você está em xeque!' : ''}`
          : `Vez de ${names?.[game.turn] || 'seu match'}${chess.inCheck() ? ' · em xeque' : ''}`}
      </TurnBar>

      <div className="chess-board" role="grid" aria-label={`Tabuleiro. Você joga de ${myColor === 'w' ? 'brancas' : 'pretas'}`}>
        {ranks.map((r) => files.map((f) => {
          const sq = f + r;
          const p = chess.get(sq);
          const dark = (FILES.indexOf(f) + r) % 2 === 1;
          const cls = ['sq', dark ? 'dark' : 'light', sel === sq && 'sel', targets.includes(sq) && (p ? 'capture' : 'target'),
            st.last && (st.last.from === sq || st.last.to === sq) && 'last', checkSq === sq && 'check'].filter(Boolean).join(' ');
          return (
            <button key={sq} className={cls} onClick={() => tap(sq)} role="gridcell"
              aria-label={`${sq}${p ? `, ${NAME[p.type]} ${p.color === 'w' ? 'branco' : 'preto'}` : ''}`}>
              {p && <span className={'piece ' + p.color}>{GLYPH[p.type]}</span>}
              {f === files[0] && <span className="coord rank">{r}</span>}
              {r === ranks[7] && <span className="coord file">{f}</span>}
            </button>
          );
        }))}
      </div>

      {error && <div role="alert" className="error">{error}</div>}

      {game.status !== 'playing' && (
        <ResultBar tone={st.result?.winner === uid || game.status === 'draw' ? 'ok' : 'bad'} action={<button className="pill on" onClick={onNew}>Nova partida</button>}>
          {resultText(st.result)}
        </ResultBar>
      )}

      {(st.moves || []).length > 0 && (
        <div className="chess-moves" aria-label="Lances">
          {st.moves.map((m, i) => <span key={i}>{i % 2 === 0 ? `${i / 2 + 1}. ` : ''}{m}</span>)}
        </div>
      )}
    </div>
  );
}
