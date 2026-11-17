import { useEffect, useRef, useState } from 'react';
import FreeCanvas from '../components/FreeCanvas.jsx';
import { ColorPicker } from '../components/AvatarEditor.jsx';
import { DRAW_WORDS, normalize } from '../data/words.js';
import { createGame, updateGame, otherOf } from '../services/api.js';
import { hide, reveal, pickRandom, GameHeader, ResultBar } from './common.jsx';

// Desenha e adivinha: quem desenha vê a palavra; o desenho aparece ao vivo para a outra pessoa,
// que chuta. Na próxima rodada os papéis trocam. "turn" = quem precisa agir agora (quem adivinha).
export const startDrawGuess = (match, uid, drawer = uid) =>
  createGame(match.id, uid, 'desenho', otherOf({ users: match.users }, drawer),
    { word: hide(pickRandom(DRAW_WORDS)), drawer, image: '', guesses: [] }, 'Desenha e adivinha');

export default function DrawGuess({ match, game, uid, names, onBack, onNew }) {
  const st = game.state;
  const word = reveal(st.word);
  const drawing = st.drawer === uid;
  const guesser = otherOf(match, st.drawer);
  const playing = game.status === 'playing';
  const [color, setColor] = useState('#2B2B2B');
  const [brush, setBrush] = useState(6);
  const [guess, setGuess] = useState('');
  const [error, setError] = useState('');
  const canvas = useRef(null);
  const timer = useRef(null);
  const last = useRef(0);

  // envia o desenho no máximo a cada 0,7 s enquanto a pessoa desenha.
  // Cada pessoa grava só o próprio campo (image ou guesses): o banco mescla, ninguém apaga o do outro.
  const pushDrawing = () => {
    clearTimeout(timer.current);
    const wait = Math.max(0, 700 - (Date.now() - last.current));
    timer.current = setTimeout(async () => {
      last.current = Date.now();
      try { await updateGame(match.id, game.id, { state: { image: canvas.current.toDataURL() } }); }
      catch (e) { setError(e.message); }
    }, wait);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  const send = async () => {
    const g = guess.trim();
    if (!g) return;
    setGuess(''); setError('');
    const ok = normalize(g).replace(/[\s-]/g, '') === normalize(word).replace(/[\s-]/g, '');
    try {
      await updateGame(match.id, game.id, {
        state: { guesses: [...(st.guesses || []), { text: g, by: uid, ok }] },
        status: ok ? 'won' : 'playing',
      });
    } catch (e) { setError(e.message); }
  };

  const skip = () => updateGame(match.id, game.id, { state: { word: hide(pickRandom(DRAW_WORDS.filter((w) => w !== word))), image: '', guesses: [] } })
    .then(() => canvas.current?.clear());
  const giveUp = () => updateGame(match.id, game.id, { status: 'ended' });
  const nextRound = () => onNew(guesser === uid ? uid : guesser); // quem adivinhou agora desenha

  const guesses = st.guesses || [];
  const roleText = drawing ? 'Você desenha' : `${names?.[st.drawer] || 'Seu match'} desenha · você adivinha`;

  return (
    <div className="game col gap-10">
      <GameHeader title="Desenha e adivinha" onBack={onBack} />
      {playing && <div className={'turn-bar' + (drawing ? '' : ' mine')}><span className="turn-dot" aria-hidden="true" />{roleText}</div>}

      {playing && drawing && (
        <div className="secret-word">
          Desenhe: <strong>{word}</strong>
          <button className="pill" onClick={skip} style={{ marginLeft: 'auto' }}>Trocar palavra</button>
        </div>
      )}

      <div className="draw-stage">
        {playing && drawing ? (
          <FreeCanvas ref={canvas} color={color} brush={brush} onChange={pushDrawing} hint="Desenhe a palavra. Sem letras, hein!" />
        ) : st.image ? (
          <img src={st.image} alt={`Desenho de ${names?.[st.drawer] || 'seu match'}`} className="draw-image" />
        ) : (
          <div className="draw-empty">{playing ? `Esperando ${names?.[st.drawer] || 'seu match'} começar a desenhar…` : 'Sem desenho'}</div>
        )}
      </div>

      {playing && drawing && (
        <>
          <ColorPicker color={color} setColor={setColor} />
          <div className="row wrap gap-6">
            {[[3, 'Fino'], [6, 'Médio'], [12, 'Grosso']].map(([w, label]) => (
              <button key={w} className={'pill' + (brush === w ? ' on' : '')} onClick={() => setBrush(w)}>{label}</button>
            ))}
            <button className="pill dashed" onClick={() => canvas.current.undo()}>Desfazer</button>
            <button className="pill dashed" onClick={() => canvas.current.clear()}>Limpar</button>
            <button className="pill dashed" onClick={giveUp}>Encerrar</button>
          </div>
        </>
      )}

      {guesses.length > 0 && (
        <div className="row wrap gap-6" aria-label="Chutes">
          {guesses.map((g, i) => <span key={i} className={'guess-chip' + (g.ok ? ' ok' : '')}>{g.text}</span>)}
        </div>
      )}

      {playing && !drawing && (
        <div className="row gap-8">
          <label htmlFor="dg-guess" className="sr-only">Seu chute</label>
          <input id="dg-guess" className="input grow" style={{ minWidth: 0 }} value={guess} maxLength={40} autoComplete="off"
            onChange={(e) => setGuess(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="O que é o desenho?…" />
          <button className="btn btn-primary" style={{ width: 'auto', minHeight: 50, padding: '0 18px' }} onClick={send}>Chutar</button>
        </div>
      )}

      {error && <div role="alert" className="error">{error}</div>}

      {game.status === 'won' && (
        <ResultBar action={<button className="pill on" onClick={nextRound}>Nova rodada</button>}>
          Acertou! Era <strong>{word}</strong>. Na próxima, {guesser === uid ? 'você desenha' : `${names?.[guesser] || 'seu match'} desenha`}.
        </ResultBar>
      )}
      {game.status === 'ended' && (
        <ResultBar tone="bad" action={<button className="pill on" onClick={nextRound}>Nova rodada</button>}>
          Rodada encerrada. A palavra era <strong>{word}</strong>.
        </ResultBar>
      )}
    </div>
  );
}
