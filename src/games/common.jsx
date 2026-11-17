// Peças compartilhadas pelos jogos.

// Esconde a resposta no banco para não ficar legível de cara (não é segurança, só evita spoiler)
export const hide = (s) => btoa(unescape(encodeURIComponent(String(s).split('').reverse().join(''))));
export const reveal = (s) => decodeURIComponent(escape(atob(s))).split('').reverse().join('');
export const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];

// Faixa "Sua vez / Vez de Fulano" usada em todos os jogos
export function TurnBar({ game, uid, names, children }) {
  if (game.status !== 'playing') return null;
  const mine = game.turn === uid;
  return (
    <div className={'turn-bar' + (mine ? ' mine' : '')} role="status" aria-live="polite">
      <span className="turn-dot" aria-hidden="true" />
      {children || (mine ? 'Sua vez' : `Vez de ${names?.[game.turn] || 'seu match'}`)}
    </div>
  );
}

// Cabeçalho de cada jogo: voltar para a lista + título
export function GameHeader({ title, onBack, right }) {
  return (
    <div className="row between gap-8" style={{ marginBottom: 4 }}>
      <button className="pill" onClick={onBack} aria-label="Voltar para a lista de jogos">‹ Jogos</button>
      <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--tinta)', textAlign: 'center', flex: 1 }}>{title}</div>
      <div style={{ minWidth: 72, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
    </div>
  );
}

// Faixa de resultado no fim do jogo
export function ResultBar({ tone = 'ok', children, action }) {
  return (
    <div className={'result-bar ' + tone} role="status" aria-live="polite">
      <div style={{ flex: 1 }}>{children}</div>
      {action}
    </div>
  );
}
